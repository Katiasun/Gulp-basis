const { src, dest, watch, parallel, series } = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoPrefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const terser = require('terser');
const gulpTerser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const config = {
  srcHTML: 'public/index.html',
  srcImgs: 'public/img/**/*',
  srcJS: 'src/js/script.js',
  srcStyles: 'src/scss/style.scss'
};

const devMode = argv.hasOwnProperty('dev');
const prodMode = !devMode;

console.log(`isDevMode: ${devMode}`); // проверяем на всякий случай какой мод

function openDevServer() {
  browserSync.init({
    server: {
      baseDir: 'public/'
    },
    port: 3000,
    notify: false,
    open: false // разкоментить, если не хочешь чтобы постоянно новые вкладки открывались
  });
}

function layout() {
  return src(config.srcHTML)
    .pipe(
      gulpif(
        prodMode,
        htmlmin({
          collapseWhitespace: true,
          useShortDoctype: true,
          minifyURLs: true,
          removeComments: true
        })
      )
    )
    .pipe(dest('dist'));
}

function cleanDist() {
  return del('dist');
}

function imageMin() {
  return src(config.srcImgs)
    .pipe(
      gulpif(
        prodMode,
        imagemin([
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 75, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
          })
        ])
      )
    )
    .pipe(dest('dist/img'));
}

function scripts() {
  return src(['node_modules/jquery/dist/jquery.js', config.srcJS])
    .pipe(concat('main.min.js'))
    .pipe(gulpif(prodMode, gulpTerser({}, terser.minify)))
    .pipe(dest('public/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return (
    src(config.srcStyles) // файл для чтения
      .pipe(sass(prodMode ? { outputStyle: 'compressed' } : { outputStyle: 'expanded' }).on('error', sass.logError)) // компрессим и преобразуем его в css c помощью пакета sass (у нас не было пакета scss, который был указан)
      .pipe(concat('style.min.css')) // переименовываем с помощью пакета concat
      .pipe(
        gulpif(
          prodMode,
          autoPrefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
          })
        )
      )
      .pipe(dest('public/css')) // указываем пункт назначения с помощью пакета dest.
      // Мы указываем главныю папку public и вложенную папку css в которой будет хранится наш новообразованный файл
      .pipe(browserSync.stream())
  ); // Компилировать scss в CSS и автоматически вводить в браузеры
}

function build() {
  return src(['public/css/style.min.css', 'public/fonts/**/*', 'public/js/main.min.js'], { base: 'public' }).pipe(
    dest('dist')
  );
}

function watching() {
  watch(['src/scss/**/*.scss'], styles); // здесь мы отслеживаем изменения во всех папках где есть файлы с расширением .scss в папке src/scss
  watch(['src/js/*.js'], scripts);
  watch(['public/*.html']).on('change', browserSync.reload); // отслеживаем изменения в файлах с расширением .html в папке public
}

// добавляем новые методы
exports.openDevServer = openDevServer;
exports.styles = styles;
exports.layout = layout;
exports.watching = watching;
exports.scripts = scripts;
exports.imageMin = imageMin;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, styles, scripts, imageMin, layout, build);
// тут мы указываем имена функция, которые хотим выполнить при дефолтной команде gulp
// то есть мы хотим обрабатывать styles и browsersync и watching обновременно
exports.default = parallel(styles, scripts, openDevServer, watching);
