exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(64)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'collaborations',
    'unique_playlist_id_and_user_id',
    'UNIQUE (playlist_id, user_id)',
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations_playlist_id_playlists_id',
    'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'collaborations',
    'fk_collaborations_user_id_users_id',
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
