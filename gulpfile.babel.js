import gulp from 'gulp';
import typescript from 'gulp-typescript';
import merge from 'merge-stream';
import del from 'del';
import { createInterface } from 'readline';
import fs from 'fs';

const env = {
  test: '',
  blah: ''
};

const dir = {
  src: 'src',
  build: 'build'
};

gulp.task('init', () => {
  let result;
  if (!fs.existsSync('prisma/.env')) {
    // interface to read from command line
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    for (const property in env) {
      readline.question(`${property.toString()}${env[property] ? ` (${env[property]})` : ''}: `, ans => {
        const write = `${env[property]}=${ans}`;
        fs.appendFile('prisma/.env', write, err => console.error(err));
        readline.close();
      });
    }

    result = gulp.src('prisma/.env').pipe(gulp.dest('build'));
  }
  result = gulp.src('prisma/.env')
    .pipe(gulp.dest('build'));
  return result;
});

gulp.task('clean', () => del([ dir.build ]))

gulp.task('server', () => {
  let entry = gulp.src(`${dir.src}/index.ts`)
    .pipe(typescript(require('./tsconfig.json').compilerOptions))
	.pipe(gulp.dest(`${dir.build}/${dir.src}`));
  let everything_else = gulp.src('./*(!(node_modules|tests))/**/*.ts')
    .pipe(typescript(require('./tsconfig.json').compilerOptions))
    .pipe(gulp.dest(`${dir.build}`));
  return merge(entry, everything_else);
});

gulp.task('default', gulp.series('clean', 'server', 'init'));