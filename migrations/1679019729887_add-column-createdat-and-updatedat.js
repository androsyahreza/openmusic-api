/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumn('users', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addColumn('authentications', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addColumn('playlists', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addColumn('playlist_songs', {
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'created_at', 'updated_at');
  pgm.dropColumn('authentications', 'created_at', 'updated_at');
  pgm.dropColumn('playlists', 'created_at', 'updated_at');
  pgm.dropColumn('playlist_songs', 'created_at', 'updated_at');
};
