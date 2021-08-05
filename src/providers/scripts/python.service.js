const {PythonShell} = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js');

const COMMON_BASE_SCRIPT = 'scripts.py';

const getParamsItem = function(specificParams) {
  return {
    mode: 'text',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.PYTHON_SCRIPTS_PATH,
    args: [...specificParams, '--wd', SERVER_CONFIG.WORKING_DIRECTORY]
  };
}

// INPUT: bot params like age, education level, likes and dislikes.
// OUTPUT: the bot object.
const createBot = function(age, educationLevel, likes, dislikes, callback) {
  const params = getParamsItem([PY_SCRIPTS.CREATE_BOT, age, educationLevel, likes, dislikes]);
  console.log('PYTHON createBot ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, callback);
};

// INPUT: an id for the model, a corpus file name from where to train it, the list of model descriptors and the number of iterations.
// OUTPUT: a trained model for these options.
const trainModel = function(modelId, fileName, modelDescriptorList, iterations, callback) {
  const params = getParamsItem([PY_SCRIPTS.TRAIN_MODEL, modelId, fileName, modelDescriptorList, '-n', iterations]);
  console.log('PYTHON trainModel ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, callback);
};

// INPUT: a bot and the model descriptor list.
// OUTPUT: the bot object trained at what he likes/dislikes.
const teachBot = function(bot, modelDescriptorList, callback) {
  const params = getParamsItem([PY_SCRIPTS.TEACH_BOT, bot, modelDescriptorList]);
  console.log('PYTHON teachBot ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, callback);
};

// INPUT: the bot, the input thread, the filter parameters and optionally the message to reply.
// OUTPUT: the conversation output message.
const answerThread = function(bot, thread, filterParams, messageToReply, callback) {
  const params = getParamsItem([PY_SCRIPTS.ANSWER_THREAD, bot, thread, filterParams, messageToReply]);
  console.log('PYTHON answerThread ' + JSON.stringify(params));
  PythonShell.run(COMMON_BASE_SCRIPT, params, callback);
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