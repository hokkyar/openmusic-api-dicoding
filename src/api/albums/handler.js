class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const albumId = await this._service.addAlbum(request.payload)
    return h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    }).code(201)
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)
    return {
      status: 'success',
      data: {
        album
      }
    }
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params
    await this._service.editAlbumById(id, request.payload)
    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)
    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }

  async postAlbumLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials
    const { id: albumId } = request.params

    await this._service.addAlbumLike(userId, albumId)

    return h.response({
      status: 'success',
      message: 'Aksi berhasil dilakukan'
    }).code(201)
  }

  async getAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params
    const { likes, cache } = await this._service.getAlbumLike(albumId)
    const response = h.response({
      status: 'success',
      data: {
        likes
      }
    })
    if (cache) response.header('X-Data-Source', 'cache')
    response.code(200)
    return response
  }
}

module.exports = AlbumsHandler
