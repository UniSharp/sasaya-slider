const gulp = require('gulp');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

class Task {
  constructor(name, src, dest) {
    this.name = name;
    this.src = src;
    this.dest = dest;
  }

  build() {
    gulp.task(this.name, () => this.handle(this.src, this.dest));
  }

  handle(src, dest) {
    throw Error('You need to override this method.');
  }
}

class Jade extends Task {
  handle(src, dest) {
    return (
      gulp.src(src)
          .pipe(jade({ pretty: true }))
          .on('error', notify.onError('Error: <%= error.message %>'))
          .pipe(gulp.dest(dest))
          .pipe(notify(`File: ${dest}/<%= file.relative %> Compiled!`))
          .pipe(browserSync.reload({ stream: true }))
    );
  }
}

class Scss extends Task {
  handle(src, dest) {
    return (
      gulp.src(src)
          .pipe(sourcemaps.init())
          .pipe(sass())
          .on('error', notify.onError('Error: <%= error.message %>'))
          .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
          .pipe(gulp.dest(dest))
          .pipe(filter(file => gutil.env.production))
          .pipe(cleanCss())
          .on('error', notify.onError('Error: <%= error.message %>'))
          .pipe(rename({ suffix: '.min' }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest(dest))
          .pipe(notify(`File: ${dest}/<%= file.relative %> Compiled!`))
          .pipe(browserSync.stream({ match: '**/*.css' }))
    );
  }
}

class Babel extends Task {
  handle(src, dest) {
    return (
      gulp.src(src)
          .pipe(sourcemaps.init())
          .pipe(babel({ presets: ['es2015'] }))
          .on('error', notify.onError('Error: <%= error.message %>'))
          .pipe(gulp.dest(dest))
          .pipe(filter(file => gutil.env.production))
          .pipe(uglify())
          .on('error', notify.onError('Error: <%= error.message %>'))
          .pipe(rename({ suffix: '.min' }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest(dest))
          .pipe(notify(`File: ${dest}/<%= file.relative %> Compiled!`))
        );
  }
}

class Copy extends Task {
  handle(src, dest) {
    return (
      gulp.src(src)
          .pipe(gulp.dest(dest))
          .pipe(notify(`File: ${dest}/<%= file.relative %> Copied!`))
    );
  }
}

(() => {
  let isWatching = false;

  (new Jade('jade', './src/jade/index.jade', './demo')).build();
  (new Scss('scss:demo', './src/sass/demo.scss', './demo/css')).build();
  (new Scss('scss', './src/sass/sasaya-slider.scss', './dist/css')).build();
  (new Babel('babel', './src/babel/sasaya-slider.js', './dist/js')).build();
  (new Copy('copy:js', './bower_components/jquery/dist/jquery.min.js', './demo/js')).build();
  (new Copy('copy:fonts', './bower_components/font-awesome-sass/assets/fonts/**/*', './demo/fonts')).build();

  gulp.task('watch', () => {
    isWatching = true;

    browserSync.init({
      host: '0.0.0.0',
      server: './',
      open: false
    });

    gulp.watch('./src/jade/**/*.jade', ['jade']);
    gulp.watch('./src/sass/**/*.scss', ['scss']);
    gulp.watch('./src/babel/**/*.js', ['js']);
  });

  gulp.task('default', ['scss', 'babel', 'jade', 'scss:demo', 'copy:js', 'copy:fonts']);

  gulp.on('stop', () => {
    if (!isWatching) {
      process.nextTick(() => process.exit(0))
    }
  });
})();
