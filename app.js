const express = require("express");
const cors  = require("cors");
const env = require("./config/env");
const { initializeBuckets } = require("./config/s3");

const app = express();
const PORT = env.PORT;


app.use(cors());

app.use(express.static("public"));

async function startServer() {
  await initializeBuckets();

  app.listen(PORT, () => {
    console.log(`Server running on  http://localhost:${PORT}`);
  });
}

startServer();
