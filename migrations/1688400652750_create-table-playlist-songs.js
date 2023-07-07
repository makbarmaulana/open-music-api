exports.up = (pgm) => {
  pgm.createTable('playlistsongs', {
    id: {
      type: 'VARCHAR(64)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'playlistsongs',
    'unique_playlist_id_and_song_id',
    'UNIQUE (playlist_id, song_id)',
  );

  pgm.addConstraint(
    'playlistsongs',
    'fk_playlistsongs_playlist_id_playlists_id',
    'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'playlistsongs',
    'fk_playlistsongs_song_id_songs_id',
    'FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsongs');
};
