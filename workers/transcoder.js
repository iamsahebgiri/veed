// import RabbitMQConnection from '../config/rabbitmq';

// import { TranscodeService } from '../services/transcodeService';
// import { sendWebNotification } from '../utils/notifications';
const RabbitMQConnection = require('../config/rabbitmq');
const { VIDEO_TRANSCODE_QUEUE } = require("../config/env");
const { TranscodeService } = require("../services/transcodeService");
const { getObject } = require("../config/s3");
const cluster = require("cluster");
const env = require('../config/env');

async function startWorker() {
  await RabbitMQConnection.connect();
  const channel = await RabbitMQConnection.getChannel();

  channel.consume(VIDEO_TRANSCODE_QUEUE, async (msg) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log(`[WORKER #${cluster.worker.id}]`, content);
        
        const { key } = content;

        // Download file from MinIO
        const tempInputPath = `./tmp/input-${key}`;

        getObject(env.UPLOAD_BUCKET, key, tempInputPath);

        const transcodeService = new TranscodeService();
        
        // Transcode to HLS
        const hlsOutputDir = await transcodeService.transcodeToHLS(tempInputPath, key);
        console.log('HLS Output Dir:', hlsOutputDir);
        // Upload HLS files to MinIO
        await transcodeService.uploadHLSToStorage(hlsOutputDir, key);

        // // Send web notification
        // await sendWebNotification(fileName, 'Transcoding Complete');

        // Acknowledge message
        channel.ack(msg);
      } catch (error) {
        console.error('Transcode Error:', error);
        channel.nack(msg, false, false);
      }
    }
  });
}

module.exports = {
    startWorker
}