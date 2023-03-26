const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
  constructor(cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addCollaboration(playlistId, userId, owner) {
    const queryCheckUser = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId]
    }
    const resultCheckUser = await this._pool.query(queryCheckUser)
    if (!resultCheckUser.rowCount) throw new NotFoundError('User tidak ditemukan')

    const id = `collab-${nanoid(16)}`
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }
    this._cacheService.delete(`playlists:${owner}`)
    return result.rows[0].id
  }

  async deleteCollaboration(playlistId, userId, owner) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }

    this._cacheService.delete(`playlists:${owner}`)
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId]
    }
    const result = await this._pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsService
