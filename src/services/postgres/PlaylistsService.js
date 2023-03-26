const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
    this._cacheService = cacheService
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
    await this._cacheService.delete(`playlists:${owner}`)
    return result.rows[0].id
  }

  async getPlaylists(owner) {
    try {
      const result = await this._cacheService.get(`playlists:${owner}`)
      return result
    } catch (error) {
      const query = {
        text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner=users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE playlists.owner = $1 OR collaborations.user_id = $1 GROUP BY playlists.id, users.username',
        values: [owner]
      }
      const result = await this._pool.query(query)
      return result.rows
    }
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
    await this._cacheService.delete(`playlists:${owner}`)
  }

  async getSinglePlaylist(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner=users.id WHERE playlists.id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    return result.rows
  }

  async addPlaylistSong(playlistId, songId, userId) {
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
    await this.addActivities(playlistId, songId, userId, 'add')
    return result.rows[0].id
  }

  async getPlaylistSongsById(playlistId) {
    const playlistDetail = await this.getSinglePlaylist(playlistId)
    const { name, username } = playlistDetail[0]
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    const songs = result.rows
    return { playlist: { id: playlistId, name, username, songs } }
  }

  async deletePlaylistSongById(playlistId, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Lagu dari playlist gagal dihapus. Id tidak valid')
    }
    await this.addActivities(playlistId, songId, userId, 'delete')
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) throw new NotFoundError('Playlist tidak ditemukan')

    const playlist = result.rows[0]
    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }

  async addActivities(playlistId, songId, userId, action) {
    const id = `act-${nanoid(16)}`
    const time = new Date()
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time]
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Activities gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities INNER JOIN playlists ON playlist_song_activities.playlist_id=playlists.id INNER JOIN songs ON playlist_song_activities.song_id=songs.id INNER JOIN users ON playlists.owner=users.id WHERE playlist_song_activities.playlist_id=$1',
      values: [playlistId]
    }
    const result = await this._pool.query(query)
    return result.rows
  }
}

module.exports = PlaylistsService
