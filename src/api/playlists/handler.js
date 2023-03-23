class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
  }

  async postPlaylistHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const songId = await this._service.addSong(request.payload)
    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId
      }
    }).code(201)
  }

  async getPlaylistsHandler(request, h) {
    const songs = await this._service.getSongs(request.query)
    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async deletePlaylistsByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }

  async postPlaylistSongsByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const songId = await this._service.addSong(request.payload)
    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId
      }
    }).code(201)
  }

  async getPlaylistSongsByIdHandler(request, h) {
    const { id } = request.params
    const song = await this._service.getSongById(id)
    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  async deletePlaylistSongsByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = PlaylistsHandler
