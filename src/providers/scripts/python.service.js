const pythonShell = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js');

let options = {
  mode: 'text',
  pythonPath: SERVER_CONFIG.PYTHON_PATH,
  pythonOptions: undefined,//['-u']
  scriptPath: SERVER_CONFIG.PYTHON_SCRIPTS_PATH,
  args: undefined//['value1', 'value2', 'value3']
};

exports.executeScript1 = function(callback) {
  pythonShell.run(PY_SCRIPTS.SCRIPT1, options, callback);
};

exports.executeScript1 = function(callback) {
  pythonShell.run(PY_SCRIPTS.SCRIPT2, options, callback);
};