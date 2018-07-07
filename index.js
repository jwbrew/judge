const critical = require("critical");
const chokidar = require("chokidar");
const cheerio = require("cheerio");

const fs = require("fs");

const base = process.argv[2];
// const styles = process.argv[3];

// console.log({ styles });

const update = path => {
  return critical
    .generate({
      base: ".",
      src: path,
      // css: [styles],
      width: 1300,
      height: 900,
      minify: true,
      penthouse: {
        screenshots: {
          basePath: path, // absolute or relative; excluding file extension
          type: "jpeg", // jpeg or png, png default
          quality: 60 // only applies for jpeg type
        }
      }
    })
    .then(css => {
      fs.readFile(path, "utf8", function(err, data) {
        if (err) throw err;
        const $ = cheerio.load(data);
        if ($("style#critical").length > 0) {
          $("style#critical").text(css);
        } else {
          $("head").append(
            `<style id="critical" type='text/css'>${css}</style>`
          );
          $('link[rel="stylesheet"]').appendTo($("body"));
        }

        if (data === $.html()) return;

        //Do your processing, MD5, send a satellite to the moon, etc.
        fs.writeFile(path, $.html(), function(err) {
          if (err) throw err;
          console.log("complete");
        });
      });
    });
};

chokidar
  .watch(base)
  .on("all", console.log)
  .on("add", update)
  .on("change", update);
