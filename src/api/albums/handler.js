const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._service.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikesAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyAlbum(id);
    const result = await this._service.addUserAlbumLikes(credentialId, id);

    const response = h.response({
      status: 'success',
      message: result,
    });

    response.code(201);
    return response;
  }

  async getLikesAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, isCache } = await this._service.getUserAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(likes, 10),
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumHandler;
