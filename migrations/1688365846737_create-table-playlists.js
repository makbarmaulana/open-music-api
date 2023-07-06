exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(64)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(128)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'playlists',
    'fk_playlists_owner_users_id',
    'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
