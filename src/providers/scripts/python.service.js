const pythonShell = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      PY_SCRIPTS = require('../../constants/python.constants.js');

const getParamsItem = function() {
  return {
    mode: 'json',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.PYTHON_SCRIPTS_PATH,
    args: undefined//['value1', 'value2', 'value3']
  };
}

// INPUT: a bot id and a bot name.
// OUTPUT: the bot object.
const createBot = function(botId, botName, callback) {
  const params = getParamsItem();
  params.args = [botId, botName];
  pythonShell.run(PY_SCRIPTS.CREATE_BOT, params, callback);
};

// INPUT: an id for the model, a corpus from where to train it and some keywords associated with the model.
// OUTPUT: a trained model for these options.
const trainModel = function(modelId, corpus, keywords, callback) {
  const params = getParamsItem();
  params.args = [modelId, corpus, keywords];
  pythonShell.run(PY_SCRIPTS.TRAIN_MODEL, params, callback);
};

// INPUT: a bot and the model that you want to teach it.
// OUTPUT: the bot object trained at the specified model.
const teachBot = function(bot, model, callback) {
  const params = getParamsItem();
  params.args = [bot, model];
  pythonShell.run(PY_SCRIPTS.TEACH_BOT, params, callback);
};

// INPUT: the bot, the input thread, the filter parameters and optionally the message to reply.
// OUTPUT: the conversation output message.
const answerThread = function(bot, thread, filterParams, messageToReply, callback) {
  const params = getParamsItem();
  params.args = [bot, thread, filterParams, messageToReply];
  pythonShell.run(PY_SCRIPTS.ANSWER_THREAD, params, callback);
};



// Necesito crear a Ricardo.
// A Python le paso el nombre.
// Python me devuelve el objeto de Ricardo.

// Necesito crear un modelo de 'futbol'.
// A Python le paso un nombre para identificar al modelo, el corpus, los keywords.
// Python me devuelve algo que describe al modelo, ya veremos cómo. Quizás contiene la ruta. /JSON/

// Quiero que Ricardo aprenda de futbol.
// A python le paso el objeto de ricardo y el modelo ('futbol')
// Invoco enseñarBot()
// Python me devuelve el objeto json de ricardo actualizado

// Quiero que Ricardo hable de futbol, respuesta sencilla o respuesta a alguien:
// A python le paso el objeto de Ricardo, le paso el "hilo" original que Ricardo "lee" y opina de ello, parámetros de filtrado, y opcionalmente la intervención de a quien tenga que responder
// Python me devuelve el mensaje de Ricardo



const pythonService = {
  createBot,
  trainModel,
  teachBot,
  answerThread,
};

module.exports = pythonService;