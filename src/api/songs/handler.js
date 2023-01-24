class SongsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const songId = await this._service.addSong(request.payload)
    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      }
    }).code(201)
  }

  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs(request.query)
    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params
    const song = await this._service.getSongById(id)
    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const { id } = request.params
    await this._service.editSongById(id, request.payload)
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    }
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    }
  }

}

module.exports = SongsHandler