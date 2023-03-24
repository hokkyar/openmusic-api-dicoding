const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapSongsDBToModel } = require('../../utils/songs')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }
    const { rows } = await this._pool.query(query)
    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }
    return rows[0].id
  }

  async getSongs({ title, performer }) {
    let query

    if (title && performer) {
      query = `SELECT id, title, performer FROM songs WHERE lower(title) LIKE '%${title}%' AND lower(performer) LIKE '%${performer}%'`
    } else if (title || performer) {
      query = `SELECT id, title, performer FROM songs WHERE lower(title) LIKE '%${title}%' OR lower(performer) LIKE '%${performer}%'`
    } else {
      query = 'SELECT id, title, performer FROM songs'
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const { rowCount, rows } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
    return rows.map(mapSongsDBToModel)[0]
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }
    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }
    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = SongsService
