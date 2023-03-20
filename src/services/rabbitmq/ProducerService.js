const amqp = require('amqplib');
const config = require('../../utils/config');

class ProducerService {
  constructor() {
    this._connection = null;
    this._channel = null;
  }

  async sendMessage(queue, message) {
    this._connection = await amqp.connect(config.rabbitMq.server);

    this._channel = await this._connection.createChannel();
    await this._channel.assertQueue(queue, { durable: true });

    this._channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      this._connection.close();
    }, 1000);
  }
}

module.exports = ProducerService;
