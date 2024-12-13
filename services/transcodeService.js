const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { PROCESSED_BUCKET } = require("../config/env");
const { uploadObject } = require("../config/s3");

class TranscodeService {
  async transcodeToHLS(inputPath, fileName) {
    const outputDir = `./tmp/hls-${fileName}`;
    fs.mkdirSync(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-c:v libx264",
          "-profile:v main",
          "-crf 21",
          "-preset medium",
          "-start_number 0",
          "-hls_time 10",
          "-hls_list_size 0",
          "-f hls",
        ])
        .output(`${outputDir}/index.m3u8`)
        .on("start", (cmd) => console.log("Started transcoding:", cmd))
        .on("end", () => resolve(outputDir))
        .on("error", (err) => reject(err))
        .run();
    });
  }

  async uploadHLSToStorage(hlsDir, fileName) {
    const files = fs.readdirSync(hlsDir);

    for (const file of files) {
      const filePath = path.join(hlsDir, file);
      await uploadObject(
        PROCESSED_BUCKET,
        `${fileName}/${file}`,
        fs.createReadStream(filePath),
        {
          "Content-Type": file.endsWith(".m3u8")
            ? "application/x-mpegURL"
            : "video/MP2T",
        }
      );

      console.log(`Uploaded ${file} to ${PROCESSED_BUCKET}`);
    }
    // cleanup file and folders
    fs.rm(hlsDir, { recursive: true });
    fs.rm(`./tmp/input-${fileName}`);
  }
}

module.exports = {
  TranscodeService,
};


/*
typeface mono
// Define groups and nodes
API gateway [icon: aws-api-gateway]
Lambda [icon: aws-lambda]
S3 [icon: aws-simple-storage-service]

VPC Subnet [icon: aws-vpc] {
  Main Server {
    Server [icon: aws-ec2]
    Data [icon: aws-rds]
  }

  Queue [icon: aws-auto-scaling]

  Compute Nodes [color: red] {
    Worker1 [icon: aws-ec2]
    Worker2 [icon: aws-ec2]
    Worker3 [icon: aws-ec2]
  }
}

Analytics [icon: aws-redshift]

// Define connections
API gateway > Lambda > Server > Data
Server > Queue
Queue > Worker1, Worker2, Worker3
S3 < Data
Compute Nodes > Analytics
*/