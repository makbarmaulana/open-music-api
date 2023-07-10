const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator) {
    const { albumsService, storageService } = service;

    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;

    await this._albumsService.updateAlbumCover(id, fileLocation);

    const response = h
      .response({
        status: 'success',
        message: 'Cover successfully uploaded',
        data: { fileLocation },
      })
      .code(201);

    return response;
  }
}

module.exports = UploadsHandler;
