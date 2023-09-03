const express = require("express");
const zip = require("express-zip");
const bodyperser = require("body-parser");
const expressFileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ffmpegSync = require("./utils/transcoder");

const app = express();

app.use(bodyperser.urlencoded({ extended: false }));
app.use(bodyperser.json());
app.use(cors());
app.use(expressFileUpload({}));

// Main Route
app.post("/convert", async (req, res) => {
  if (!req.files) {
    res.status(404).send("Please Upload a Video File");
  }
  const file = req.files.file;
  console.log(file.mimetype);

  if (!(file.mimetype == "video/mp4" || "video/wmv" || "video/avi")) {
    res.status(404).send("Video Format Is Not Supported");
  }
  const folderName = file.name.split(".")[0];
  const filenames = [];

  // Creating a Folder
  fs.mkdir(path.join(__dirname, folderName), (err) => {
    if (err) {
      console.error(`Error creating root folder: ${err}`);
      res.send(err);
    } else {
      console.log(`Root folder created successfully.`);

      fs.mkdir(`${folderName}/output`, (err) => {
        if (err) {
          console.error(`Error creating child folder: ${err}`);
        } else {
          console.log(`Child folder childFolderName created successfully.`);
        }
      });
    }
  });

  // Move the file to the Folder
  file.mv(folderName + "/" + file.name, function (err) {
    if (err) return res.send(err);
    console.log("File uploaded...");
  });

  // Transcoding Video File
  ffmpegSync(`./${folderName}/${file.name}`, file.name, folderName)
    .then(() => {
      return new Promise((resolve, reject) => {
        try {
          fs.readdir(__dirname + "/" + folderName + "/output", (err, files) => {
            files.forEach((file) => {
              filenames.push(file);
            });
            resolve();
          });
        } catch (error) {
          return reject(new Error(err));
        }
      });
    })
    // Sending Output file as a Response
    .then(() => {
      res.zip(
        [
          {
            path: `./${folderName}/output/${filenames[0]}`,
            name: filenames[0],
          },
          {
            path: `./${folderName}/output/${filenames[1]}`,
            name: filenames[1],
          },
          {
            path: `./${folderName}/output/${filenames[2]}`,
            name: filenames[2],
          },
        ],
        // After sending the response Delete the Folder
        () => {
          fs.rmdir(
            __dirname + "/" + folderName,
            { recursive: true, force: true },
            function () {
              console.log("file deleted");
            }
          );
        }
      );
    });
});

// Test Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/test", (req, res) => {
  res.send("Test Route");
});

// Server
app.listen(8000, () => {
  console.log(`Example app listening on port 8000`);
});
