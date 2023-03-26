class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service
    this._validator = validator
    this._albumsService = albumsService
  }

  async postUploadImageCoverHandler(request, h) {
    const { cover } = request.payload
    this._validator.validateImageCoverHeaders(cover.hapi.headers)

    const { id: albumId } = request.params
    const filename = await this._service.writeFile(cover, cover.hapi)
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`

    await this._albumsService.editAlbumCover(coverUrl, albumId)

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah'
    }).code(201)
  }
}

module.exports = UploadsHandler
