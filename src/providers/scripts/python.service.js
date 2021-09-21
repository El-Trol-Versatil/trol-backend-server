const {PythonShell} = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js'),
      Utils = require('../../helpers/utils.helper.js');

const COMMON_BASE_SCRIPT = 'scripts.py';
const FORCE_ASCII_INPUT = '--ascii-in',
  FORCE_ASCII_OUTPUT = '--ascii-out';

const LOG_EXECUTION_ARGUMENTS = false;

const _getParamsItem = function(specificParams) {
  return {
    mode: 'text',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.PYTHON_SCRIPTS_PATH,
    args: [...specificParams]
    // args: [...specificParams, '--wd', SERVER_CONFIG.WORKING_DIRECTORY]
  };
}

// INPUT: bot params like age, education level, likes and dislikes.
// OUTPUT: the bot object.
const createBot = function(age, educationLevel, likes, dislikes, callback) {
  const params = _getParamsItem([PY_SCRIPTS.CREATE_BOT, age, educationLevel, likes, dislikes]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.createBot: ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.createBot: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const realAnswerOutput = textArrayAnswer[textArrayAnswer.length - 1];
      callback(null, realAnswerOutput);
    }
  });
};

// INPUT: an id for the model, a corpus file name from where to train it, the list of model descriptors and the number of iterations.
// OUTPUT: a trained model for these options.
const trainModel = function(modelId, fileName, modelDescriptorList, iterations, callback) {
  const asciiMDL = Utils.stringToAscii(modelDescriptorList);
  const params = _getParamsItem([
    PY_SCRIPTS.TRAIN_MODEL, modelId, fileName, asciiMDL, '-n', iterations,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.trainModel: ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.trainModel: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const realAnswerOutput = textArrayAnswer[textArrayAnswer.length - 1];
      const stringMDL = Utils.asciiToString(realAnswerOutput);
      callback(null, stringMDL);
    }
  });
};

// INPUT: a bot and the model descriptor list.
// OUTPUT: the bot object trained at what he likes/dislikes.
const teachBot = function(bot, modelDescriptorList, callback) {
  const asciiBot = Utils.stringToAscii(bot);
  const asciiMDL = Utils.stringToAscii(modelDescriptorList);
  const params = _getParamsItem([
    PY_SCRIPTS.TEACH_BOT, asciiBot, asciiMDL,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.teachBot: ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.teachBot: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const realAnswerOutput = textArrayAnswer[textArrayAnswer.length - 1];
      const stringUpdatedBot = Utils.asciiToString(realAnswerOutput);
      callback(null, stringUpdatedBot);
    }
  });
};

// INPUT: the bot, the input thread and the filter parameters.
// OUTPUT: the conversation output message.
const answerThread = function(bot, messageToReply, filterParams, callback) {
  const asciiBot = Utils.stringToAscii(bot);
  const params = _getParamsItem([
    PY_SCRIPTS.ANSWER_THREAD, asciiBot, messageToReply, ...filterParams,
    FORCE_ASCII_INPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.answerThread: ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.answerThread: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const realAnswerOutput = textArrayAnswer[textArrayAnswer.length - 1];
      callback(null, realAnswerOutput);
    }
  });
};

const pythonService = {
  createBot,
  trainModel,
  teachBot,
  answerThread,
};

module.exports = pythonService;