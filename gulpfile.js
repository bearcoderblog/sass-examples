"use strict";

var gulp = require("gulp"),
  watch = require("gulp-watch"),
  prefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify"),
  sass = require("gulp-sass"),
  sourcemaps = require("gulp-sourcemaps"),
  cssmin = require("gulp-minify-css"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  rimraf = require("rimraf"),
  rigger = require("gulp-rigger"),
  cache = require("gulp-cache"),
  cached = require("gulp-cached"),
  pug = require("gulp-pug"),
  gulpIf = require("gulp-if"),
  newer = require("gulp-newer"),
  remember = require("gulp-remember"),
  path = require("path"),
  notify = require("gulp-notify"),
  plumber = require("gulp-plumber"),
  eslint = require("gulp-eslint"),
  browserSync = require("browser-sync"),
  reload = browserSync.reload,
  fs = require("fs");

var pathStatic = {
  build: {
    html: "build/",
    css: "build/css/",
  },
  src: {
    html: "src/index.pug",
    css: "src/style.scss",
  },
  watch: {
    html: "src/**/*.pug",
    css: "src/**/*.scss",
  },
  clean: "./build",
};

const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == "development";

var config = {
  server: {
    baseDir: "./build",
  },
  notify: false,
  host: "localhost",
  port: 9000,
  logPrefix: "BearCoder",
};

gulp.task("webserver", function () {
  browserSync(config);
});

gulp.task("clean", function (cb) {
  rimraf(pathStatic.clean, cb);
});

gulp.task("html:build", function () {
  return gulp
    .src(pathStatic.src.html)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "html",
            message: err.message,
          };
        }),
      })
    )
    .pipe(cached("html"))
    .pipe(newer(pathStatic.build.html))
    .pipe(pug({}))
    .pipe(rigger())
    .pipe(remember("html"))
    .pipe(gulp.dest(pathStatic.build.html))
    .pipe(reload({ stream: true }));
});

gulp.task("css:build", function () {
  return (
    gulp
      .src(pathStatic.src.css)
      .pipe(
        plumber({
          errorHandler: notify.onError(function (err) {
            return {
              title: "css",
              message: err.message,
            };
          }),
        })
      )
      // .pipe(cached("css"))
      .pipe(newer(pathStatic.build.css))
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(
        sass({
          sourceMap: true,
          errLogToConsole: true,
        })
      )
      .pipe(
        prefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
          cascade: true,
        })
      )
      .pipe(gulpIf(!isDevelopment, cssmin()))
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(remember("css"))
      .pipe(gulp.dest(pathStatic.build.css))
      .pipe(reload({ stream: true }))
  );
});

gulp.task("cacheClear", function () {
  cache.clearAll();
});

gulp.task(
  "build",
  gulp.series("html:build", "css:build")
);

gulp
  .watch(pathStatic.watch.html, gulp.series("html:build"))
  .on("unlink", function (filepath) {
    remember.forget("html", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });
gulp
  .watch(pathStatic.watch.css, gulp.series("css:build"))
  .on("unlink", function (filepath) {
    remember.forget("css", path.resolve(filepath));
    delete cached.cashes.styles[path.resolve.filepath];
  });

gulp.task("default", gulp.series("build", gulp.parallel("webserver")));
