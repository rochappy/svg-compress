const fs = require('fs-extra');
const path = require('path');
const pkg = require('./package.json');

const copyFiles = [{
  from: 'jquery/dist/',
  name: 'jquery.min.js',
  to: './js/'
}, {
    from: 'bootstrap/dist/js/',
    name: 'bootstrap.min.js',
    to: './js/'
  }, {
    from: 'bootstrap/dist/css/',
    name: 'bootstrap.min.css',
    to: './css/'
  } ];

copyFiles.map((item) => {
  fs.copy(path.join(__dirname, `node_modules/${item.from}${item.name}`), path.join(__dirname, `${item.to}${item.name}`));
});

delete pkg.scripts
delete pkg.devDependencies
console.log(pkg);

fs.writeFile('./package-copy.json', JSON.stringify(pkg, null, '  '));