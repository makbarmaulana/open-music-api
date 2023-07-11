const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    const { albumsService, songsService } = service;

    this._albumsService = albumsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum(name, year);

    const response = h
      .response({
        status: 'success',
        message: 'Album successfully created.',
        data: { albumId },
      })
      .code(201);

    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async updateAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._albumsService.updateAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album successfully updated.',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album successfully deleted.',
    };
  }

  async likeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.likeAlbum(userId, albumId);

    const response = h
      .response({
        status: 'success',
        message: 'Album successfully liked.',
      })
      .code(201);

    return response;
  }

  async getAlbumLikesCountHandler(request) {
    const { id: albumId } = request.params;

    const likes = await this._albumsService.getAlbumLikesCount(albumId);

    return {
      status: 'success',
      data: { likes },
    };
  }

  async unlikeAlbumHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.unlikeAlbum(userId, albumId);

    return {
      status: 'success',
      message: 'Album successfully unliked.',
    };
  }
}

module.exports = AlbumsHandler;
