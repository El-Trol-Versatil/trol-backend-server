const {PythonShell} = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js'),
      Utils = require('../../helpers/utils.helper.js');

const COMMON_BASE_SCRIPT = 'scripts.py';
const FORCE_ASCII_INPUT = '--ascii-in',
  FORCE_ASCII_OUTPUT = '--ascii-out';

const LOG_EXECUTION_ARGUMENTS = false;

const getParamsItem = function(specificParams) {
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
  const params = getParamsItem([PY_SCRIPTS.CREATE_BOT, age, educationLevel, likes, dislikes]);
  LOG_EXECUTION_ARGUMENTS && console.log('PYTHON createBot ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
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
  const params = getParamsItem([
    PY_SCRIPTS.TRAIN_MODEL, modelId, fileName, asciiMDL, '-n', iterations,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('PYTHON trainModel ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      debugger;
      callback(err);
    } else {
      debugger;
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
  const params = getParamsItem([
    PY_SCRIPTS.TEACH_BOT, asciiBot, asciiMDL,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('PYTHON teachBot ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
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
  const params = getParamsItem([
    PY_SCRIPTS.ANSWER_THREAD, asciiBot, messageToReply, ...filterParams,
    FORCE_ASCII_INPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('PYTHON answerThread ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('ERROR answerThread: ' + err);
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

// Necesito crear a Ricardo.
// A Python le paso la edad, la educación, sus likes y sus dislikes.
// Python me devuelve el objeto de Ricardo.

// Necesito crear un modelo de 'futbol'.
// A Python le paso un id para identificar al modelo, la ruta del corpus, el modelDescriptorList y el num de iteraciones.
// Python me devuelve el model descriptor list actualizado.

// Quiero que Ricardo aprenda más info acerca de lo que le gusta y lo que no le gusta.
// A python le paso el objeto de ricardo y el model descriptor list.
// Python me devuelve el objeto json de ricardo actualizado

// Quiero que Ricardo hable de futbol, respuesta sencilla o respuesta a alguien:
// A python le paso el objeto de Ricardo, hilo en el que Ricardo quiere responder, parámetros de filtrado.
// Los parámetros de filtrado son máximo de caracteres (-nc 280) y el número de respuestas (-nor 100, cuantas más, más probabilidad de que sea preciso).
// getResponse "..." "asdbashdbahsd asdhbahsdbahsd " -nc 280 -nor 100
// [opcionalmente la intervención de a quien tenga que responder iría en el contexto o meteríamos el hilo completo]
// Python me devuelve el mensaje de Ricardo

const pythonService = {
  createBot,
  trainModel,
  teachBot,
  answerThread,
};

module.exports = pythonService;