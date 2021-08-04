var chokidar = require('chokidar'),
  fs = require('fs');

// .on('change', function(path) {
//   console.log('File', path, 'has been changed');
// })
// .on('unlink', function(path) {
//   console.log('File', path, 'has been removed');
// })
// .on('error', function(error) {
//   console.error('Error happened', error);
// })

// for reading current files:
// testFolder = './tests/';
const scanFolder = function(folder, callback) {
  fs.readdir(folder, function (err, files) {
    if (err) {
      console.log('FAILED RUN scanFolder path ' + folder);
      callback(err);
    } else {
      console.log('SUCCESS RUN scanFolder path ' + folder);
      callback(files);
    }
  });
}

// for scanning folder file changes:
// testFolder = './tests/';
const onNewFileAdded = function(folder, callback) {
  console.log('fileSystemService onNewFileAdded LISTENING for path', folder);
  const watcher = chokidar.watch(folder, {ignored: /^\./, persistent: true});
  watcher
    .on('add', function(path) {
      console.log('File', path, 'has been added');
      callback(path);
    })
}

const fileSystemService = {
  scanFolder,
  onNewFileAdded,
};

module.exports = fileSystemService;