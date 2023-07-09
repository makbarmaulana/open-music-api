const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, validator) {
    const { ProducerService, playlistsService } = service;

    this._ProducerService = ProducerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this._ProducerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h
      .response({
        status: 'success',
        message: 'Your request is in the queue',
      })
      .code(201);

    return response;
  }
}

module.exports = ExportsHandler;
