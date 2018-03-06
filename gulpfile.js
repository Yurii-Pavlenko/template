"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var del = require("del");
var concat = require("gulp-concat");
var run = require("run-sequence");
var server = require("browser-sync").create();
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var csso = require("gulp-csso");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var jpegoptim = require("imagemin-jpegoptim");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");


// Компиляция стилей проекта
gulp.task("style", function () {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

// Локальный сервер
gulp.task("serve", function () {
  server.init({
    server: "build/",
    cors: true,
    notify: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html", ["html"]);
  gulp.watch("source/js/*.js", ['js']);
});

// Минификация JS скриптов
gulp.task("js", function () {
  return gulp.src([,
    "source/js/**/*.js"
  ])
    .pipe(concat("script.js"))
    .pipe(concat("picturefill.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

// Оптимизация изображений
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

//Генерация webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
});

// Сборка SVG спрайта
gulp.task("sprite", function () {
  return gulp.src("source/img/icons/!*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

//Модификация html
gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

// Удаление каталога сборки
gulp.task("clean", function () {
  return del("build");
});

// Копирование файлов
gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/js/*.js",
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

// Сборка проекта
gulp.task("build", function (done) {
  run("clean",
      "copy",
      "style",
      "images",
      "sprite",
      "html",
      done);
});
