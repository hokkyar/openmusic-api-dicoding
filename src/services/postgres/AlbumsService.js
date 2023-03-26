const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapAlbumsDBToModel } = require('../../utils/albums')

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }
    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }
    await this._cacheService.delete(`albums:${result.rows[0].id}`)
    return result.rows[0].id
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`albums:${id}`)
      return result
    } catch (error) {
      const queryAlbum = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id]
      }
      const resultAlbum = await this._pool.query(queryAlbum)
      if (!resultAlbum.rowCount) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      const querySongInAlbum = {
        text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
        values: [id]
      }
      const resultSong = await this._pool.query(querySongInAlbum)

      const mappedResult = mapAlbumsDBToModel(resultAlbum.rows[0])

      const result = {
        ...mappedResult,
        songs: resultSong.rows
      }

      return result
    }
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id',
      values: [name, year, id]
    }
    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
    await this._cacheService.delete(`albums:${id}`)
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }
    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
    await this._cacheService.delete(`albums:${id}`)
  }

  async addAlbumLike(userId, albumId) {
    await this.getAlbumById(albumId)

    const { rowCount } = await this._pool.query({
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    })

    let query
    if (!rowCount) {
      const id = `likes-${nanoid(16)}`
      query = {
        text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3)',
        values: [id, userId, albumId]
      }
    } else {
      query = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
        values: [userId, albumId]
      }
    }

    await this._pool.query(query)
    await this._cacheService.delete(`albums-likes:${albumId}`)
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`albums-likes:${albumId}`)
      return {
        likes: JSON.parse(result),
        cache: true
      }
    } catch (error) {
      const { rows } = await this._pool.query({
        text: 'SELECT COUNT(id) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId]
      })
      await this._cacheService.set(`albums-likes:${albumId}`, JSON.stringify(Number(rows[0].likes)))
      return {
        likes: Number(rows[0].likes),
        cache: false
      }
    }
  }
}

module.exports = AlbumsService
