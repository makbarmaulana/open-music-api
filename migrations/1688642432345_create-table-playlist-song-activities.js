exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
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
    user_id: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(16)',
      notNull: true,
    },
    time: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint(
    'playlist_song_activities',
    'fk_playlist_song_activities_playlist_id_playlists_id',
    'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities');
};
