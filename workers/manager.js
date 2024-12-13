const amqp = require("amqplib");
const os = require("os");
const cluster = require("cluster");
const { startWorker } = require("./transcoder");

class WorkerManager {
  static async start() {
    if (cluster.isPrimary) {
      const numCPUs = os.cpus().length;
      console.log(
        `Primary ${process.pid} is running. Forking ${numCPUs} workers.`
      );

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      });
    } else {
      console.log(`Worker ${process.pid} started.`);
      await startWorker();
    }
  }
}

// Start the workers
(async () => {
  try {
    await WorkerManager.start();
  } catch (error) {
    console.error("Failed to start workers:", error);
    process.exit(1);
  }
})();
