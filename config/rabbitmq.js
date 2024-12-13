const amqp = require("amqplib");

const env = require("./env");

class RabbitMQ {
  #connection;
  #channel;

  constructor() {
    this.#connection = null;
    this.#channel = null;
  }

  async connect() {
    if (this.#connection) return this.#connection;

    this.#connection = await amqp.connect({
      hostname: env.RABBITMQ_HOST,
      port: env.RABBITMQ_PORT,
      username: env.RABBITMQ_USER,
      password: env.RABBITMQ_PASS,
    });
    this.#channel = await this.#connection.createChannel();

    this.#channel.assertQueue(env.VIDEO_TRANSCODE_QUEUE, {
      durable: true,
    });

    return this.#connection;
  }

  async getChannel() {
    if (!this.#channel) {
      await this.connect();
    }
    return this.#channel;
  }

  async publishJob(job) {
    const channel = await this.getChannel();
    channel.sendToQueue(env.VIDEO_TRANSCODE_QUEUE, Buffer.from(JSON.stringify(job)), {
      persistent: true
    });
  }
}

module.exports = new RabbitMQ();
