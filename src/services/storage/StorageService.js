const fs = require('fs')
const { Pool } = require('pg')

class StorageService {
  constructor(folder) {
    this._pool = new Pool()
    this._folder = folder
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  }
}

module.exports = StorageService
