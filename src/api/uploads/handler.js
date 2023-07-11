const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator) {
    const { albumsService, storageService } = service;

    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadAlbumCoverHandler(request, h) {
    // Get album information
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);

    // Validate image content type
    const { cover } = request.payload;
    this._validator.validateImageHeaders(cover.hapi.headers);

    // Save album cover file to storage and create the file location URL
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;

    // Remove old album cover file in the storage if it exists
    const oldCover = album.coverUrl;
    if (oldCover) {
      await this._storageService.deleteFile(oldCover);
    }

    // Update new album cover URL in the database
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
