/**
 * Léo Le Bras <leo.lebrasf@gmail.com>
 *
 * From website-starter-kit
 * (https://github.com/LeoLeBras/website-starter-kit)
 *
 * Work with Gulp
 * http://gulpjs.com/
 *
 * Copyright 2016
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 */

import base64 from 'gulp-base64'
import browserSync  from 'browser-sync'
import cssbeautify  from 'gulp-cssbeautify'
import cssnano  from 'gulp-cssnano'
import cache from 'gulp-cached'
import del from 'del'
import gulp  from 'gulp'
import gulpIf  from 'gulp-if'
import imagemin  from 'gulp-imagemin'
import named from 'vinyl-named'
import path from 'path'
import pngquant  from 'imagemin-pngquant'
import postcss  from 'gulp-postcss'
import rev from 'gulp-rev'
import revReplace from 'gulp-rev-replace'
import runSequence from 'run-sequence'
import sass  from 'gulp-sass'
import sourcemaps  from 'gulp-sourcemaps'
import ttf2woff  from 'gulp-ttf2woff'
import ttf2woff2  from 'gulp-ttf2woff2'
import twig from 'gulp-twig'
import watch  from 'gulp-watch'
import webpack from 'webpack'
import webpackStream  from 'webpack-stream'
import { argv } from 'yargs'
import config from './../config.js'

const { srcDir, buildDir, distDir, cssDir, imgDir, sassDir, fontsDir, jsDir, soundDir } = config.dir

const dev = argv.watch ? true : false
const production = argv.prod ? true : false
const destDir =  production ? distDir : buildDir


// Browser sync
gulp.task('browser_sync', () => {
  const bs = browserSync.create()
  return bs.init({
    server: destDir,
    files: [
      destDir + cssDir + '*.css',
      destDir + '*.html',
      destDir + imgDir + '*',
      destDir + jsDir + '*.js'
    ],
    port: config.server.port,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: true,
    }
  })
})



// Sass
gulp.task('sass', () => {
  let customFonts = {},
      weights = [],
      fonts = config.fonts.custom

  weights[300] = 'Light'
  weights[400] = 'Regular'
  weights[500] = 'Medium'
  weights[600] = 'SemiBold'
  weights[700] = 'Bold'
  weights[800] = 'ExtraBold'
  weights[900] = 'Black'

  for(let font in fonts) {
    customFonts[font] = {variants: {}}
    fonts[font].map(weight => {
      let url = {}
      config.fonts.formats.split(' ').map(format => {
        url[format] = `../${production ? '' : '../'}fonts/${font.replace(/\s+/g, '')}/${font.replace(/\s+/g, '')}-${weights[weight]}.${format}`
      })
      customFonts[font]['variants'][weight] = {
        [weight]: { url: url }
      }
    })
  }

  return gulp.src(srcDir + sassDir + '**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss([
      require('autoprefixer')({
        browsers: config.css.autoprefixer
      })
    ]))
    .pipe(postcss([
      require('postcss-font-magician')({
        custom: customFonts,
        formats: config.fonts.formats
      })
    ]))
    .pipe(gulpIf(dev, cssbeautify()))
    .pipe(gulpIf(dev, sourcemaps.write('.')))
    .pipe(gulpIf(production, base64({ extensions: ['svg', 'png', 'jpg'], maxImageSize: 8*1024})))
    .pipe(gulpIf(production, cssnano()))
    .pipe(cache('sass'))
    .pipe(gulp.dest(destDir + cssDir))
})


// Babel
gulp.task('js', () => (
  gulp.src(`${srcDir + jsDir}*.js`)
    .pipe(named())
    .pipe(webpackStream({
      devtool: dev ? 'source-map' : '',
      watch: dev,
      output: {
        path: destDir + config.dir.jsDir,
        filename: '[name].js'
      },
      resolve: {
        extensions: ['', '.js'],
        modulesDirectories: [
          'node_modules',
          'src/js/',
        ],
        alias: {
          '@helpers': path.resolve(srcDir, 'js/helpers'),
          '@vendors': path.resolve(srcDir, 'js/vendors'),
        },
      },
      module: {
        loaders: [{
          loader: 'babel-loader',
          query: config.javascript.babel,
          exclude: [
            path.resolve(__dirname, '../node_modules/'),
          ],
        }]
      },
      plugins: [
        new webpack.DefinePlugin({
          'NODE_ENV': process.env.NODE_ENV || 'development',
        }),
        new webpack.NoErrorsPlugin()
      ].concat(production
        ? [new webpack.optimize.UglifyJsPlugin()]
        : []
      )
    }))
    .on('error', (err) => {
      console.log(err)
    })
    .pipe(gulp.dest(destDir + jsDir))
))



// Twig
gulp.task('twig', () => (
  gulp.src([srcDir + '*.twig'])
    .pipe(twig())
    .pipe(gulp.dest(destDir))
))



// Images
gulp.task('img', () => (
  gulp.src([srcDir + imgDir + '**'])
    .pipe(cache('img'))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(destDir + imgDir))
))


// Sounds
gulp.task('sound', () => {
  gulp.src(srcDir + 'sounds/*.m4a')
    .pipe(gulp.dest(destDir + soundDir))
})


// HTML
gulp.task('html', () => {
  gulp.src(srcDir + '*.html')
    .pipe(cache('html'))
    .pipe(gulp.dest(destDir))
})



// Fonts
gulp.task('fonts', () => {
  gulp.src(srcDir + 'fonts/**/*.ttf')
    .pipe(ttf2woff())
    .pipe(gulp.dest(destDir + fontsDir))
  gulp.src(srcDir + 'fonts/**/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest(destDir + fontsDir))
})



// Clean destDir
gulp.task('clean', () => {
  del.sync(destDir + '**/*', {
    force: true
  })
})



// Revision
gulp.task('revision', () => (
  gulp.src([destDir + cssDir + '*.css', destDir + jsDir + '*.js'], { base: destDir })
    .pipe(rev())
    .pipe(gulp.dest(destDir))
    .pipe(rev.manifest())
    .pipe(gulp.dest(destDir))
))



// Rev replace
gulp.task('revreplace', ['revision'], () => {
  const manifest = gulp.src(destDir + 'rev-manifest.json')
  return gulp.src(srcDir + '*.html')
    .pipe(revReplace({ manifest }))
    .pipe(gulp.dest(destDir))
})



// Dev
gulp.task('dev', () => {
  runSequence(
    'clean',
    ['twig', 'html'],
    ['fonts', 'sass', 'img', 'sound'],
    'browser_sync',
    'js'
  )
  if(dev) {
    watch(srcDir + sassDir + '**/*.scss',  () => gulp.start('sass'))
    watch(srcDir + imgDir + '*',  () => gulp.start('img'))
    watch(srcDir + '*.twig',  () => gulp.start('twig'))
    watch(srcDir + '*.html',  () => gulp.start('html'))
  }
})



// Build
gulp.task('build', () => {
  runSequence(
    'clean',
    ['twig', 'fonts', 'sass', 'img', 'js', 'sound'],
    'revreplace',
  )
})


/*

      _____       _
     / ____|     | |
    | |  __ _   _| |_ __
    | | |_ |  | | | |  _ \
    | |__| | |_| | | |_) |
     \_____|\__,_|_|  __/  .
                   | |
                   |_|

*/
