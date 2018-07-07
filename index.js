const critical = require("critical");
const chokidar = require("chokidar");
const cheerio = require("cheerio");

const fs = require("fs");

const base = process.argv[2];

const update = path => {
  return critical
    .generate({
      base: ".",
      src: path,
      width: 1300,
      height: 900,
      minify: true,
      penthouse: {
        screenshots: {
          basePath: path,
          type: "jpeg",
          quality: 60
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

        fs.writeFile(path, $.html(), function(err) {
          if (err) throw err;
          console.log("complete");
        });
      });
    });
};

chokidar
  .watch(base)
  .on("add", update)
  .on("change", update);
