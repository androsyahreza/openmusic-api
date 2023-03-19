const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { PlaylistsMapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, owner, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist({ owner }) {
    const query = {
      text: `SELECT p.id, p.name, u.username 
      FROM playlists p
      LEFT JOIN users u ON p.owner = u.id
      LEFT JOIN collaborations c ON p.id = c.playlist_id
      WHERE p.owner = $1 OR c.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const playlistSongId = `playlistsong-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const addSongToPlaylistQuery = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [playlistSongId, playlistId, songId, createdAt],
    };

    const addSongToPlaylistResult = await this._pool.query(addSongToPlaylistQuery);

    if (!addSongToPlaylistResult.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan pada playlist');
    }

    return addSongToPlaylistResult.rows[0].id;
  }

  async getSongFromPlaylist(id) {
    const query = {
      text: `SELECT p.id, p.name, u.username, s.id AS song_id, s.title, s.performer 
      FROM songs s 
      LEFT JOIN playlist_songs ps ON s.id = ps.song_id 
      LEFT JOIN playlists p ON ps.playlist_id = p.id
      LEFT JOIN users u ON p.owner = u.id
      WHERE p.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows.map(PlaylistsMapDBToModel)[0];
    playlist.songs = result.rows
      .filter((row) => row.song_id !== null)
      .map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      }));
    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async verifySong(songId) {
    const query = {
      text: 'SELECT * FROM songs s WHERE s.id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistsAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistSongActivities(playlistId, songId, userId, action) {
    const activitiesId = `activities-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const userAction = action;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6, $6, $6) RETURNING id',
      values: [activitiesId, playlistId, songId, userId, userAction, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activities gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT a.playlist_id, u.username, s.title, a.action, a.time
      FROM playlist_song_activities a 
      inner join (select id, name from playlists ) p on a.playlist_id = p.id
      INNER JOIN (SELECT id, title FROM songs) s ON s.id = a.song_id
      INNER JOIN (SELECT id, username FROM users) u ON u.id = a.user_id
      WHERE p.id = $1
      GROUP BY a.playlist_id, u.username, s.title, a.action, a.time
      ORDER BY a.time ASC`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Activities tidak ditemukan');
    }

    const activities = result.rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time,
    }));

    return activities;
  }
}

module.exports = PlaylistsService;
