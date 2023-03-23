const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) returning id',
      values: [id, name, owner]
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner=users.id WHERE playlists.owner = $1',
      values: [owner]
    }
    const result = await this._pool.query(query)
    return result.rows
  }

  async deletePlaylistById(id, owner) {
    await this.verifyPlaylistOwner(id, owner)
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async getSinglePlaylist(playlistId, owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner=users.id WHERE playlists.owner = $1 AND playlists.id = $2',
      values: [owner, playlistId]
    }
    const result = await this._pool.query(query)
    return result.rows
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const queryCheckOwner = {
      text: 'SELECT * FROM playlists WHERE id = $1 AND owner = $2',
      values: [playlistId, owner]
    }
    const { rowCount } = await this._pool.query(queryCheckOwner)
    if (!rowCount) throw new AuthorizationError('Credential tidak valid')
  }

  async addPlaylistSong(playlistId, songId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner)
    const queryCheckSong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId]
    }
    const { rowCount } = await this._pool.query(queryCheckSong)
    if (!rowCount) throw new NotFoundError('Lagu tidak ditemukan')

    const id = nanoid(16)
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) returning id',
      values: [id, playlistId, songId]
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist')
    return result.rows[0].id
  }

  async getPlaylistSongsById(playlistId, owner) {
    const queryCheckPlaylist = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }
    const playlistResult = await this._pool.query(queryCheckPlaylist)
    if (!playlistResult.rowCount) throw new NotFoundError('Playlist tidak ditemukan')

    await this.verifyPlaylistOwner(playlistId, owner)

    const playlistDetail = await this.getSinglePlaylist(playlistId, owner)
    const { name, username } = playlistDetail[0]
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    const songs = result.rows
    return { name, username, songs }
  }

  async deletePlaylistSongById(playlistId, songId, owner) {
    await this.verifyPlaylistOwner(playlistId, owner)
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Lagu dari playlist gagal dihapus. Id tidak valid')
    }
  }
}

module.exports = SongsService
