const { src, dest, watch, parallel, series } = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass")); // выполняем require по инструкции пакета https://www.npmjs.com/package/gulp-sass
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const autoPrefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");
// здесь параметры мы никакие не используем
function openDevServer() {
  browserSync.init({
    // правильно указываем название нашего модуля browserSync, а не browsersync, назовем функцию тогда подругому типо openDevServer
    server: {
      // тут указываем папку, в котором будет наш html - то есть в папке public у нас самый главный файл,
      // который будет считываться для browserSync пакета
      baseDir: "public/",
    },
    port: 3000,
    notify: false,
    open: false, // разкоментить, если не хочешь чтобы постоянно новые вкладки открывались
  });
}

function cleanDist() {
  return del("dist");
}

function imageMin() {
  return src("public/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/img"));
}

function scripts() {
  return src(["node_modules/jquery/dist/jquery.js", "src/js/script.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("public/js"))
    .pipe(browserSync.stream());
}

function styles() {
  return (
    src("src/scss/style.scss") // файл для чтения
      .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError)) // компрессим и преобразуем его в css c помощью пакета sass (у нас не было пакета scss, который был указан)
      .pipe(concat("style.min.css")) // переименовываем с помощью пакета concat
      .pipe(
        autoPrefixer({
          overrideBrowserslist: ["last 10 version"],
          grid: true,
        })
      )
      .pipe(dest("public/css")) // указываем пункт назначения с помощью пакета dest.
      // Мы указываем главныю папку public и вложенную папку css в которой будет хранится наш новообразованный файл
      .pipe(browserSync.stream())
  ); // Компилировать scss в CSS и автоматически вводить в браузеры
}

function build() {
  return src(
    [
      "public/css/style.min.css",
      "public/fonts/**/*",
      "public/js/main.min.js",
      "public/*.html",
    ],
    { base: "public" }
  ).pipe(dest("dist"));
}
function watching() {
  watch(["src/scss/**/*.scss"], styles); // здесь мы отслеживаем изменения во всех папках где есть файлы с расширением .scss в папке src/scss
  watch(["src/js/main.js", "!src/js/main.min.js"], scripts);
  watch(["public/*.html"]).on("change", browserSync.reload); // отслеживаем изменения в файлах с расширением .html в папке public
}

// добавляем новые методы
exports.openDevServer = openDevServer;
exports.styles = styles;
exports.watching = watching;
exports.scripts = scripts;
exports.imageMin = imageMin;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, imageMin, build);
// тут мы указываем имена функция, которые хотим выполнить при дефолтной команде gulp
// то есть мы хотим обрабатывать styles и browsersync и watching обновременно
exports.default = parallel(styles, openDevServer, watching, scripts);
