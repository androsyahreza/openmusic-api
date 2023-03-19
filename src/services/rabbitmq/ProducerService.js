const amqp = require('amqplib');
const config = require('../../utils/config');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ProducerService {
  constructor(playlistsService) {
    this._playlistsService = playlistsService;
  }

  async sendMessage(queue, message, playlistId, userId) {
    try {
      await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

      const connection = await amqp.connect(config.rabbitMq.server);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, {
        durable: true,
      });

      channel.sendToQueue(queue, Buffer.from(message));

      setTimeout(() => {
        connection.close();
      }, 1000);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
      if (error instanceof AuthorizationError) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }
}

module.exports = ProducerService;
