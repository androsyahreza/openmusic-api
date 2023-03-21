const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistsHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const { playlists, isCache } = await this._service.getPlaylist({ owner: credentialId });
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id, credentialId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongByIdHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifySong(songId);
    await this._service.verifyPlaylistsAccess(id, credentialId);
    await this._service.addSongToPlaylist(id, songId);
    await this._service.addPlaylistSongActivities(id, songId, credentialId, 'add');
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan pada playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsAccess(id, credentialId);
    const { playlist, isCache } = await this._service.getSongFromPlaylist(id);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deletePlaylistSongByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsAccess(id, credentialId);
    await this._service.deleteSongFromPlaylist(id, songId);
    await this._service.addPlaylistSongActivities(id, songId, credentialId, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistsAccess(id, credentialId);
    const { activities, isCache } = await this._service.getPlaylistActivities(id);

    const response = h.response({
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = PlaylistHandler;
