const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist(name, owner);

    const response = h
      .response({
        status: 'success',
        message: 'Playlist successfully created.',
        data: { playlistId },
      })
      .code(201);

    return response;
  }

  async getPlaylistHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { playlists, isFromCache } = await this._service.getPlaylists(owner);

    const response = h
      .response({
        status: 'success',
        data: { playlists },
      })
      .code(200);

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deletePlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist successfully deleted.',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);
    await this._service.addSongToPlaylist(playlistId, songId);
    await this._service.addPlaylistSongActivity({
      playlistId, songId, userId: owner, action: 'add',
    });

    const response = h
      .response({
        status: 'success',
        message: 'Song successfully added to playlist.',
      })
      .code(201);

    return response;
  }

  async getSongFromPlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);
    const { playlistsongs, isFromCache } = await this._service.getSongsFromPlaylist(playlistId);

    const response = h
      .response({
        status: 'success',
        data: { playlist: playlistsongs },
      })
      .code(200);

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.validateSongPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);
    await this._service.deleteSongFromPlaylist(playlistId, songId);
    await this._service.addPlaylistSongActivity({
      playlistId, songId, userId: owner, action: 'delete',
    });

    return {
      status: 'success',
      message: 'Song successfully deleted.',
    };
  }

  async getPlaylistSongActivitiesHandler(request, h) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, owner);
    const { activities, isFromCache } = await this._service.getPlaylistSongActivities(playlistId);

    const response = h
      .response({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      })
      .code(200);

    if (isFromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = PlaylistsHandler;
