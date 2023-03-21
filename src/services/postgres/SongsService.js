const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete('songs');
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    try {
      const result = await this._cacheService.get('songs');
      return {
        songs: JSON.parse(result),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: `SELECT s.id, s.title, s.performer FROM songs s 
        WHERE s.title ILIKE '%' || COALESCE($1, '') || '%' 
        AND s.performer ILIKE '%' || COALESCE($2, '') || '%'`,
        values: [title, performer],
      };
      const result = await this._pool.query(query);
      const songs = result.rows;
      await this._cacheService.set('songs', JSON.stringify(songs));
      return { songs };
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete('songs');
  }
}

module.exports = SongsService;
