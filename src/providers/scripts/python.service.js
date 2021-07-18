const pythonShell = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js');

const getParamsItem = function() {
  return {
    mode: 'text',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.PYTHON_SCRIPTS_PATH,
    args: undefined//['value1', 'value2', 'value3']
  };
}

// It needs a bot id and the options with which you want it to be trained.
// It returns the trained object for this options.
const trainBot = function(id, options, callback) {
  const params = getParamsItem();
  params.args = [id, options];
  pythonShell.run(PY_SCRIPTS.TRAIN_BOT, params, callback);
};

// It needs a bot (with its trained object) and the options for retraining.
// It returns the re-trained object for this options.
const retrainBot = function(bot, options, callback) {
  const params = getParamsItem();
  params.args = [bot, options];
  pythonShell.run(PY_SCRIPTS.RETRAIN_BOT, params, callback);
};

// It needs the bot, the topic input and the type of the expected answer.
// It returns the conversation output message.
const answerThread = function(bot, input, type, callback) {
  const params = getParamsItem();
  params.args = [bot, input, type];
  pythonShell.run(PY_SCRIPTS.ANSWER_THREAD, params, callback);
};

// It needs the bot, the topic input and the type of the expected answer.
// It returns the answer output message.
const replyThread = function(bot, input, type, callback) {
  const params = getParamsItem();
  params.args = [bot, input, type];
  pythonShell.run(PY_SCRIPTS.REPLY_THREAD, params, callback);
};

const pythonService = {
  trainBot,
  retrainBot,
  answerThread,
  replyThread,
};

module.exports = pythonService;