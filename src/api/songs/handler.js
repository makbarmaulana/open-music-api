const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    const songId = await this._service.addSong({
      title, year, performer, genre, duration, albumId,
    });

    const response = h
      .response({
        status: 'success',
        message: 'Song successfully added.',
        data: { songId },
      })
      .code(201);

    return response;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._service.getSongs({ title, performer });

    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: { song },
    };
  }

  async updateSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;

    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    await this._service.updateSongById(id, {
      title, year, performer, genre, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Song successfully updated.',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song successfully deleted.',
    };
  }
}

module.exports = SongsHandler;
