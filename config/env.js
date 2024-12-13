const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 8001,
    
    MINIO_END_POINT: process.env.MINIO_END_POINT,
    MINIO_PORT: parseInt(process.env.MINIO_PORT),
    MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_REGION: process.env.MINIO_REGION || "ap-south-2",
    
    UPLOAD_BUCKET: process.env.UPLOAD_BUCKET || "raw-uploads",
    PROCESSED_BUCKET: process.env.PROCESSED_BUCKET || "processed-videos",

    RABBITMQ_HOST: process.env.RABBITMQ_HOST || "localhost",
    RABBITMQ_PORT: parseInt(process.env.RABBITMQ_PORT) || 5672,
    RABBITMQ_USER: process.env.RABBITMQ_DEFAULT_USER || "guest",
    RABBITMQ_PASS: process.env.RABBITMQ_DEFAULT_PASS || "guest",
    VIDEO_TRANSCODE_QUEUE: process.env.VIDEO_TRANSCODE_QUEUE || "video-transcode",
};