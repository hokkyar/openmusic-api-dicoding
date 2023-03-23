const { Pool } = require('pg')
const { nanoid } = require('nanoid')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`
    console.log(id)
  }
}

module.exports = SongsService
