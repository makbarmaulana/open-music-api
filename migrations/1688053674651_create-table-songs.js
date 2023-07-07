exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(64)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(128)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(32)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(64)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false,
    },
    album_id: {
      type: 'VARCHAR(64)',
      notNull: false,
    },
  });

  pgm.addConstraint(
    'songs',
    'fk_songs_album_id_albums_id',
    'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
