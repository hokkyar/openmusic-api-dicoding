class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials
    const playlistId = await this._service.addPlaylist(name, credentialId)
    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    }).code(201)
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)
    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistsByIdHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials
    await this._service.deletePlaylistById(id, credentialId)
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus'
    }
  }

  async postPlaylistSongsByIdHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials
    const playlistSongsId = await this._service.addPlaylistSong(playlistId, songId, credentialId)
    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke dalam Playlist',
      data: {
        playlistSongsId
      }
    }).code(201)
  }

  async getPlaylistSongsByIdHandler(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials
    const { name, username, songs } = await this._service.getPlaylistSongsById(id, credentialId)
    return {
      status: 'success',
      data: {
        playlist: {
          id,
          name,
          username,
          songs
        }
      }
    }
  }

  async deletePlaylistSongsByIdHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials
    await this._service.deletePlaylistSongById(playlistId, songId, credentialId)
    return {
      status: 'success',
      message: 'Lagu di dalam playlist berhasil dihapus'
    }
  }
}

module.exports = PlaylistsHandler
