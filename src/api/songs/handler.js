const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Song added successfully',
      data: { songId },
    }).code(201);

    return response;
  }

  async getSongsHandler() {
    const songs = await this._service.getSongs();

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

  async editSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Song updated successfully',
    };
  }
}

module.exports = SongsHandler;
