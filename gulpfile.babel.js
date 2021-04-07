import gulp from 'gulp';
import typescript from 'gulp-typescript';
import merge from 'merge-stream';
import del from 'del';
import readlineSync from 'readline-sync';
import fs from 'fs';

const env = {
  DEVMODE: false,
  DATABASE_URL: 'DATABASE_URL="postgres://user:pass@host:port/db'
}

const dir = {
  src: 'src',
  dist: 'dist'
};

const fileExists = async (file) => {
  try {
    return fs.promises.access(file, fs.constants.F_OK)
    .then(() => true);
  } catch (err) {
    return false;
  }
}

gulp.task('init', async () => {
  fs.access('.env', (err) => {
    if (err) {
      console.log('.env does not exist. Please answer the following prompts: (default listed in parens)');
      for (const property in env) {
        const ans = readlineSync.question(`${property.toString()}${env[property] != undefined ? ` (${env[property]})` : ''}: `);
        if (!ans) {
          ans = env[property];
        }
        const write = `${property}=${ans}\n`;
        fs.appendFile('.env', write, err => console.error(err));
      }
    }
    
    const result = gulp.src('.env')
      .pipe(gulp.dest(dir.dist));
    return result;
  });
});

gulp.task('clean', () => del([ dir.dist ]))

gulp.task('server', () => {
  let entry = gulp.src(`${dir.src}/index.ts`)
    .pipe(typescript(require('./tsconfig.json').compilerOptions))
	.pipe(gulp.dest(`${dir.dist}/${dir.src}`));
  let everything_else = gulp.src('./*(!(node_modules|tests))/**/*.ts')
    .pipe(typescript(require('./tsconfig.json').compilerOptions))
    .pipe(gulp.dest(`${dir.dist}`));
  return merge(entry, everything_else);
});

gulp.task('default', gulp.series('clean', 'server', 'init'));