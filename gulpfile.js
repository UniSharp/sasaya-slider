const gulp = require('gulp');
const sass = require('gulp-sass');
const jade = require('gulp-jade');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

gulp.task('jade', () =>
  gulp.src('./src/jade/index.jade')
      .pipe(jade(gutil.env.production ? {} : { pretty: true }))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(gulp.dest('./'))
      .pipe(notify('File: ./<%= file.relative %> Compiled!'))
      .pipe(browserSync.reload({ stream: true }))
);

gulp.task('sass', () =>
  gulp.src('./src/sass/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass(gutil.env.production ? { outputStyle: 'compressed' } : {}))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./temp/css'))
      .pipe(notify('File: ./temp/css/<%= file.relative %> Compiled!'))
);

gulp.task('css', ['sass'], () =>
  gulp.src([
        './temp/css/main.css'
      ])
      .pipe(sourcemaps.init())
      .pipe(concat('main.css'))
      .pipe(gutil.env.production ? cleanCss() : gutil.noop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./dist/css'))
      .pipe(notify('File: ./dist/css/<%= file.relative %> Compiled!'))
      .pipe(browserSync.stream({ match: '**/*.css' }))
);

gulp.task('babel', () =>
  gulp.src('./src/babel/sasaya-slider.js')
      .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['es2015'] }))
      .on('error', notify.onError('Error: <%= error.message %>'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./temp/js'))
      .pipe(notify('File: ./temp/js/<%= file.relative %> Compiled!'))
);

gulp.task('js', ['babel'], () =>
  gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/tether/dist/js/tether.js',
        './bower_components/bootstrap/dist/js/bootstrap.js',
        './temp/js/sasaya-slider.js'
      ])
      .pipe(sourcemaps.init())
      .pipe(concat('sasaya-slider.js'))
      .pipe(gutil.env.production ? uglify() : gutil.noop())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(notify('File: ./dist/js/<%= file.relative %> Compiled!'))
      .pipe(browserSync.reload({ stream: true }))
);

gulp.task('copy:fonts', () =>
  gulp.src('./bower_components/font-awesome-sass/assets/fonts/**/*')
      .pipe(gulp.dest('./dist/fonts'))
      .pipe(notify('File: ./dist/fonts/<%= file.relative %> Copied!'))
);

gulp.task('copy', ['copy:fonts']);

gulp.task('clean:temp', ['css', 'js'], () =>
  gulp.src('./temp')
      .pipe(clean())
);

gulp.task('clean:dist', () =>
  gulp.src(['./dist', 'index.html'])
      .pipe(clean())
);

gulp.task('clean', ['clean:temp', 'clean:dist']);

gulp.task('watch', () => {
  browserSync.init({
    host: '0.0.0.0',
    server: './',
    open: false
  });

  gulp.watch('./src/jade/**/*.jade', ['jade']);
  gulp.watch('./src/sass/**/*.scss', ['css']);
  gulp.watch('./src/babel/**/*.js', ['js']);
});

gulp.task('default', ['jade', 'css', 'js', 'copy', 'clean:temp']);
