const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {
  mapPlaylistSongsDBToModel,
  mapPlaylistsDBToModel,
  mapPlaylistActivitiesDBToModel,
} = require('../../utils');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError(
        'Failed to create playlist. Missing required fields.',
      );
    }

    await this._cacheService.delete(`playlists:${owner}`);

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const playlists = await this._cacheService.get(`playlists:${owner}`);
      return { playlists: JSON.parse(playlists), isFromCache: true };
    } catch (error) {
      const query = {
        text: `
        SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        JOIN users ON users.id = playlists.owner
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
        GROUP BY playlists.id, users.username
      `,
        values: [owner],
      };

      const result = await this._pool.query(query);
      const playlists = result.rows;

      await this._cacheService.set(`playlists:${owner}`, JSON.stringify(playlists));

      return { playlists, isFromCache: false };
    }
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Failed to delete playlist. Playlist ID ${playlistId} not found.`);
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlists:${owner}`);
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.verifySongById(songId);

    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed add song to playlist.');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }

  async getSongsFromPlaylist(playlistId) {
    try {
      const playlistsongs = await this._cacheService.get(`playlistsongs:${playlistId}`);
      return { playlistsongs: JSON.parse(playlistsongs), isFromCache: true };
    } catch (error) {
      const query = {
        text: `
        SELECT
          playlists.id,
          playlists.name,
          users.username,
          songs.id AS song_id,
          songs.title,
          songs.performer
        FROM playlists
        JOIN users ON playlists.owner = users.id
        LEFT JOIN playlistsongs ON playlists.id = playlistsongs.playlist_id
        LEFT JOIN songs ON playlistsongs.song_id = songs.id
        WHERE playlists.id = $1
        `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Failed to get song in playlist.');
      }

      const playlists = mapPlaylistsDBToModel(result.rows[0]);
      const songs = result.rows.map(mapPlaylistSongsDBToModel);
      const playlistsongs = { ...playlists, songs };

      await this._cacheService.set(`playlistsongs:${playlistId}`, JSON.stringify(playlistsongs));

      return { playlistsongs, isFromCache: false };
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete song in playlist.');
    }

    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }

  async addPlaylistSongActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add playlist song activity.');
    }

    await this._cacheService.delete(`activities:${playlistId}`);
  }

  async getPlaylistSongActivities(playlistId) {
    try {
      const activities = await this._cacheService.get(`activities:${playlistId}`);
      return { activities: JSON.parse(activities), isFromCache: true };
    } catch (error) {
      const query = {
        text: `
        SELECT
          users.username,
          songs.title,
          playlist_song_activities.action,
          playlist_song_activities.time
        FROM playlist_song_activities
        JOIN users ON users.id = playlist_song_activities.user_id
        JOIN songs ON songs.id = playlist_song_activities.song_id
        WHERE playlist_song_activities.playlist_id = $1
        ORDER BY playlist_song_activities.time
        `,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Failed to get playlist song activity.');
      }

      const activities = result.rows.map(mapPlaylistActivitiesDBToModel);

      await this._cacheService.set(`activities:${playlistId}`, JSON.stringify(activities));

      return { activities, isFromCache: false };
    }
  }

  async verifySongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song not found.');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('You have no right to access this resource.');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
