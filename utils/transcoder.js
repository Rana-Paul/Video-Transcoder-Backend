const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegStatic);
const rootPath = path.join(__dirname, "../");

function ffmpegSync(filePath, fileName, folderName) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filePath)

      .size("640x480")
      // Output file

      .saveToFile(
        rootPath + folderName + `/output/${fileName.split(".")[0]}-480.mp4`
      )

      // The callback that is run when FFmpeg is finished
      .on("end", async (stdout, stderr) => {
        ffmpeg()
          .input(filePath)

          .size("1280x720")
          // Output file

          .saveToFile(
            rootPath + folderName + `/output/${fileName.split(".")[0]}-720.mp4`
          )

          // The callback that is run when FFmpeg is finished
          .on("end", async (stdout, stderr) => {
            ffmpeg()
              .input(filePath)

              .size("640x360")
              // Output file

              .saveToFile(
                rootPath +
                  folderName +
                  `/output/${fileName.split(".")[0]}-360.mp4`
              )

              // The callback that is run when FFmpeg is finished
              .on("end", async (stdout, stderr) => {
                resolve();
              });
          });
      })
      .on("error", (err) => {
        return reject(new Error(err));
      });
  });
}

module.exports = ffmpegSync;
