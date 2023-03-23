/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id')
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id')
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id')
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id')
  pgm.dropConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id')
  pgm.dropConstraint('collaborations', 'fk_collaborations.user_id_users.id')
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id')
  pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.song_id_songs.id')
}
