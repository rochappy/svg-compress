const os = require('os');

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
window.ipcRenderer = require('electron').ipcRenderer;
window.os = os;
