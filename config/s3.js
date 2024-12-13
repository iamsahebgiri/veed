const {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteBucketCommand,
} = require("@aws-sdk/client-s3");
const env = require("./env");
const fs = require("fs/promises");

const s3ClientConfig = {
  endpoint: env.MINIO_END_POINT,
  region: env.MINIO_REGION,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
  tls: env.MINIO_USE_SSL,
};

const s3Client = new S3Client(s3ClientConfig);

const initializeBuckets = async () => {
  const buckets = [env.UPLOAD_BUCKET, env.PROCESSED_BUCKET];

  for (const bucket of buckets) {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      console.log(`Bucket "${bucket}" already exists.`);
    } catch (err) {
      if (err.name === "NotFound") {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`Bucket "${bucket}" created successfully.`);
      } else {
        console.error(`Error checking or creating bucket "${bucket}":`, err);
        throw err;
      }
    }
  }
};

async function uploadObject(bucketName, key, body, ...rest) {
  try {
    console.log(`Uploading object to bucket: ${bucketName}, key: ${key}`);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ...rest,
      })
    );
    console.log(`Object uploaded successfully.`);
  } catch (error) {
    console.error(`Error uploading object:`, error);
  }
}

async function getObject(bucketName, key, outputPath) {
  try {
    console.log(`Retrieving object from bucket: ${bucketName}, key: ${key}`);
    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    console.log(`Object retrieved successfully.`);
    const fileStream = await fs.writeFile(
      outputPath, 
      await data.Body.transformToByteArray()
    );
    console.log(`File downloaded to ${outputPath}`);
  } catch (error) {
    console.error(`Error retrieving object:`, error);
  }
}

async function listObjects(bucketName) {
  try {
    console.log(`Listing objects in bucket: ${bucketName}`);
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    console.log(`Objects:`, data.Contents);
  } catch (error) {
    console.error(`Error listing objects:`, error);
  }
}

async function deleteObject(bucketName, key) {
  try {
    console.log(`Deleting object from bucket: ${bucketName}, key: ${key}`);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    console.log(`Object deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting object:`, error);
  }
}

async function deleteBucket(bucketName) {
  try {
    console.log(`Deleting bucket: ${bucketName}`);
    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting bucket:`, error);
  }
}

module.exports = {
  s3Client,
  s3ClientConfig,
  initializeBuckets,
  uploadObject,
  getObject,
  listObjects,
  deleteObject,
  deleteBucket,
};
