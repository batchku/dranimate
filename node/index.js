const fs = require('fs');
const express = require("express");
const multer = require("multer");
const base64Img = require("base64-img");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(
  express.static("/home/lazar/projects/irllabs/U-2-Net/test_data")
);
app.use(bodyParser.json({ limit: "50mb" }));

app.post("/upload", (req, res) => {
  const { image } = req.body;

  const imageName = Date.now();

  base64Img.img(
    image,
    "/home/lazar/projects/irllabs/U-2-Net/test_data/test_images",
    imageName,
    (err, filepath) => {
      const python = spawn(
        "python3",
        ["/home/lazar/projects/irllabs/U-2-Net/u2net_test.py"],
        { cwd: "/home/lazar/projects/irllabs/U-2-Net" }
      );

      python.on('error', function(err) {
        console.log('Error: ' + err);
      });

      python.stdout.on('data', function (data) {
        console.log(`From python: ${data}`);
       });

       python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);

        const outputFilePath = `/home/lazar/projects/irllabs/U-2-Net/test_data/u2net_results/${imageName}.png`;

        const contents = fs.readFileSync(outputFilePath, {encoding: 'base64'});

        fs.rmSync(outputFilePath);
        fs.rmSync(filepath);

        res.send(contents);
      });
    }
  );
});

app.listen(3000, () => {
  console.log(`Listening on port: ${3000}`);
});
