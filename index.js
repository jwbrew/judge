const critical = require("critical");
const chokidar = require("chokidar");
const cheerio = require("cheerio");
const glob = require("glob");

const fs = require("fs");

const base = process.argv[2];
const css = process.argv[3];

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

const updateAll = () => {
  return glob(base, function(er, files) {
    return Promise.all(files.map(update)).then(() =>
      console.log("CSS Changed. Updated All")
    );
  });
};

chokidar
  .watch(base)
  .on("add", update)
  .on("change", update);

chokidar.watch(css).on("change", updateAll);
