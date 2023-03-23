/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    name: {
      type: 'TEXT',
      notNull: true
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('playlists')
}
