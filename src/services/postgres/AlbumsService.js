const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { AlbumsMapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT a.id, a.name, a.year, a.cover_url, s.id AS song_id, s.title, s.performer 
      FROM albums a LEFT JOIN songs s ON a.id = s.album_id WHERE a.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows.map(AlbumsMapDBToModel)[0];
    album.songs = result.rows
      .filter((row) => row.song_id !== null)
      .map((row) => ({
        id: row.song_id,
        title: row.title,
        performer: row.performer,
      }));
    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyAlbum(albumId) {
    const query = {
      text: 'SELECT * FROM albums a WHERE a.id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async addAlbumImageById(id, fileLocation) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET updated_at = $1, cover_url = $2 WHERE id = $3 RETURNING id',
      values: [updatedAt, fileLocation, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menambahkan Album Image. Id tidak ditemukan');
    }
  }

  async addUserAlbumLikes(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    try {
      const result = await this._pool.query(query);
      let message = '';
      if (!result.rowCount) {
        const id = `albumlikes-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const insertQuery = {
          text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $4)',
          values: [id, userId, albumId, createdAt],
        };
        await this._pool.query(insertQuery);
        message = 'Album berhasil disukai';
        await this._cacheService.delete(`albums:${albumId}`);
      } else {
        const deleteQuery = {
          text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
          values: [userId, albumId],
        };
        await this._pool.query(deleteQuery);
        message = 'Album batal disukai';
        await this._cacheService.delete(`albums:${albumId}`);
      }
      return message;
    } catch (error) {
      throw new InvariantError('Gagal menyukai atau tidak menyukai album');
    }
  }

  async getUserAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`);
      return {
        likes: JSON.parse(result),
        isCache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const { likes } = result.rows[0];
      await this._cacheService.set(`albums:${albumId}`, JSON.stringify(likes));

      return { likes };
    }
  }
}

module.exports = AlbumsService;
