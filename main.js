// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, shell} = require('electron');
const path = require('path');
const Svgo = require('svgo');
const { exec, execSync, spawn, spawnSync } = require('child_process');
const config = require('./config');
const fs = require('fs-extra');
const glob = require('glob');
const svg2html = require('svg2html')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function globPromise(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function handlerSvgs(event, svgs, outDir) {
  svgo = new Svgo(config);
  const handlerSvg = svgs.map((svgFile) => {
    const svgCont = fs.readFileSync(svgFile, 'utf-8');

    const base = path.parse(svgFile).base;
    return svgo.optimize(svgCont, { path: svgFile }).then((result) => {
      fs.outputFile(`${outDir}/${base}`, result.data);
      const resultData = {
        file: svgFile,
        content: result.data,
        total: svgs.length
      };
      event.sender.send('outProcess', resultData);
      return resultData;
    });
  });

  return Promise.all(handlerSvg).then((values) => {
    event.sender.send('outDone', {
      total: values.length
    });
  });
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.on('open-dialog', function (event, opts) {
  dialog.showOpenDialog(opts).then((result) => {
    event.sender.send('selectedItem', result.filePaths);
  });
});

ipcMain.on('open-dir', function (event, path) {
  const [openDir] = path
  shell.showItemInFolder(openDir);
});

ipcMain.on('outsvg', (event, data) => {
  const allSvg = [];
  const [outDir] = data[data.length - 1].outputDir
  data.map(async (item) => {
    if (item.type == 'file') {
      handlerSvgs(event,item.content, item.outputDir);
      allSvg.push(...item.content);
    } else {
      const svgs = await globPromise(`${item.content[0]}/**/*.svg`);
      handlerSvgs(event, svgs, item.outputDir);
      allSvg.push(...svgs);
    }
  });
  console.log(allSvg);
  
  console.log(allSvg.join(','));
  
  svg2html.run({
    inDir: allSvg.join(','),
    outDir,
    rmAttr: 'opacity|fill',
  });
});