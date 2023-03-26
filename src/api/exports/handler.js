class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service
    this._playlistsService = playlistsService
    this._validator = validator
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload)
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    const { targetEmail } = request.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)

    const message = { playlistId, targetEmail }
    await this._service.sendMessage('export:playlist', JSON.stringify(message))

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    }).code(201)
  }
}

module.exports = ExportsHandler
