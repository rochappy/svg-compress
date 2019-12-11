const { series, src, dest, task, parallel, gutil } = require('gulp');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const watch = require('gulp-watch');
const log = require('fancy-log');
const { spawn } = require('child_process');

let workerProcess
const jsFiles = ['./js/app.js', 'main.js'];

const start = async (st) => {
  workerProcess = spawn('npm', ['start'], {
    stdio: 'inherit'
  })

  workerProcess.on('data', (data) => {
    console.log(data);
  });

  workerProcess.on('close', (code) => {
    console.log(`子进程退出 ${code}`);
  });
}

const stop = async () => {
  workerProcess && workerProcess.pid && process.kill(workerProcess.pid);
}

const restart = async () => {
  await stop();
  await start('restart');
}

const compile = async (vinylFile) => {
  const out = src(jsFiles)
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
    }))
    .pipe(dest('./'));

  if (vinylFile.relative && vinylFile.relative.includes('main.js')) {
    restart()
  }

  return out;
}

const watchFile = async () => {
  return await watch(jsFiles, (vinylFile) => {
    log(vinylFile.relative)
    compile(vinylFile);
  });
}

task('start', start);
task('watch', watchFile);
task('compile', compile);

task('default', parallel('watch', 'start'));
task('build', series('compile'));