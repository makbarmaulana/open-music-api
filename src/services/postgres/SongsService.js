const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongsDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song. Missing required fields.');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let queryText = 'SELECT id, title, performer FROM songs';
    const queryParams = [];

    // Construct the query based on the provided search criteria
    if (title && performer) {
      queryText += ' WHERE title ILIKE $1 AND performer ILIKE $2';
      queryParams.push(`%${title}%`, `%${performer}%`);
    } else if (title) {
      queryText += ' WHERE title ILIKE $1';
      queryParams.push(`%${title}%`);
    } else if (performer) {
      queryText += ' WHERE performer ILIKE $1';
      queryParams.push(`%${performer}%`);
    }

    const query = {
      text: queryText,
      values: queryParams,
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapSongsDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Failed to get song. Song ID ${id} not found.`);
    }

    return mapSongsDBToModel(result.rows[0]);
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapSongsDBToModel);
  }

  async updateSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: `
      UPDATE songs
      SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6
      WHERE id = $7
      RETURNING id
      `,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Failed to update song. Song ID ${id} not found.`);
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(`Failed to delete song. Song ID ${id} not found.`);
    }
  }
}

module.exports = SongsService;
