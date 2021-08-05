var shell = require('shelljs');

const compileAndUploadToBoard = function (thingId, thingModel, boardModelId, boardPin, successCallback, failureCallback) {
  let scriptString;
  //scriptString = 'bash sleep_example.sh';
  scriptString = `./sketchgenerator ${thingModel} ${boardPin} ${thingId} ${boardModelId}`;
  //./sketchgenerator dht11 4 thing123456 esp8266:esp8266:nodemcuv2
  _execAsync(scriptString, function(data) {
    if (data === 'Completed') {
      console.log('Success execution of sketchgenerator ended');
      successCallback();
    } else if (data.indexOf('Error') !== -1) {
      console.log('Failed execution of sketchgenerator. STDOUT detected error');
      failureCallback(data);
    }
  }, function(error) {
    console.log('Failed execution of sketchgenerator. STDERR failure');
    failureCallback(error);
  });
}

function _execAsync(command, dataCallback, errorCallback) {
  const child = shell.exec(command, {async:true});
  child.stdout.on('data', function(data) {
    dataCallback(data.replace(/(\r\n|\n|\r)/gm,""));
  });
  child.stderr.on('data', function(error) {
    errorCallback(error.replace(/(\r\n|\n|\r)/gm,""));
  });
}

const shellScriptService = {
  compileAndUploadToBoard,
};

module.exports = shellScriptService;