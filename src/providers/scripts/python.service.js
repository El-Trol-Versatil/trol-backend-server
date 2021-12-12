const {PythonShell} = require('python-shell'),
      SERVER_CONFIG = require('../../../config/server.config.js'),
      {ETV_PY_SCRIPTS, PUBLISHER_PY_SCRIPTS} = require('../../constants/python.constants.js'),
      Utils = require('../../helpers/utils.helper.js');

const FORCE_ASCII_INPUT = '--ascii-in',
  FORCE_ASCII_OUTPUT = '--ascii-out';

const LOG_EXECUTION_ARGUMENTS = true;

const _getParamsItemForETV = function(specificParams) {
  return {
    mode: 'text',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.ETV_PYTHON_SCRIPTS_PATH,
    args: [...specificParams]
  };
}

const _getParamsItemForPublisher = function(specificParams) {
  return {
    mode: 'text',
    pythonPath: SERVER_CONFIG.PYTHON_PATH,
    pythonOptions: undefined,//['-u']
    scriptPath: SERVER_CONFIG.PUBLISHER_PYTHON_SCRIPTS_PATH,
    args: [...specificParams]
  };
}

// INPUT: bot params like age, education level, likes and dislikes.
// OUTPUT: the bot object.
const createBot = function(age, educationLevel, likes, dislikes, callback) {
  const params = _getParamsItemForETV([ETV_PY_SCRIPTS.CREATE_BOT, age, educationLevel, likes, dislikes]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.createBot: ' + JSON.stringify(params));
  PythonShell.run(SERVER_CONFIG.ETV_BASE_SCRIPT, params, function(err, textArrayAnswer) {
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

// INPUT: a bot and the model descriptor list.
// OUTPUT: the bot object trained at what he likes/dislikes.
const teachBot = function(bot, modelDescriptorList, callback) {
  const asciiBot = Utils.stringToAscii(bot);
  const asciiMDL = Utils.stringToAscii(modelDescriptorList);
  const params = _getParamsItemForETV([
    ETV_PY_SCRIPTS.TEACH_BOT, asciiBot, asciiMDL,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.teachBot: ' + JSON.stringify(params));
  PythonShell.run(SERVER_CONFIG.ETV_BASE_SCRIPT, params, function(err, textArrayAnswer) {
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

// INPUT: an id for the model, a corpus file name from where to train it, the list of model descriptors and the number of iterations.
// OUTPUT: a trained model for these options.
const trainModel = function(modelId, fileName, modelDescriptorList, iterations, callback) {
  const asciiMDL = Utils.stringToAscii(modelDescriptorList);
  const params = _getParamsItemForETV([
    ETV_PY_SCRIPTS.TRAIN_MODEL, modelId, fileName, asciiMDL, '-n', iterations,
    FORCE_ASCII_INPUT, FORCE_ASCII_OUTPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.trainModel: ' + JSON.stringify(params));
  PythonShell.run(SERVER_CONFIG.ETV_BASE_SCRIPT, params, function(err, textArrayAnswer) {
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

// INPUT: the bot, the input thread and the filter parameters.
// OUTPUT: the conversation output message.
const answerThread = function(bot, messageToReply, filterParams, callback) {
  const asciiBot = Utils.stringToAscii(bot);
  const params = _getParamsItemForETV([
    ETV_PY_SCRIPTS.ANSWER_THREAD, asciiBot, messageToReply, ...filterParams,
    FORCE_ASCII_INPUT
  ]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.answerThread: ' + JSON.stringify(params));
  PythonShell.run(SERVER_CONFIG.ETV_BASE_SCRIPT, params, function(err, textArrayAnswer) {
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

// INPUT: a list of bot ids.
// OUTPUT: the list of bots that actually got an assigned account.
const linkAccountsToBots = function(botList, callback) {
  const params = _getParamsItemForPublisher([botList]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.linkAccountsToBots: ' + JSON.stringify(params));
  PythonShell.run(PUBLISHER_PY_SCRIPTS.LINK_ACCOUNTS_TO_BOTS, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.linkAccountsToBots: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const realAnswerOutput = textArrayAnswer[textArrayAnswer.length - 1],
        parsedList = JSON.parse(realAnswerOutput),
        assignedBots = parsedList.assigned;
      callback(null, assignedBots);
    }
  });
};


// INPUT: the id of the twitter account.
// OUTPUT: the tweet id and message from the next tweet published by that account.
const listenToTwitterAccount = function(twitterAccountId, callback) {
  const params = _getParamsItemForPublisher([twitterAccountId]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.listenToTwitterAccount: ' + JSON.stringify(params));
  PythonShell.run(PUBLISHER_PY_SCRIPTS.LISTEN_TWITTER_ACCOUNT, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.listenToTwitterAccount: ' + err);
      callback(err);
    } else {
      LOG_EXECUTION_ARGUMENTS && textArrayAnswer.forEach(element => {
        console.log(element);
      });
      const tweetId = textArrayAnswer[textArrayAnswer.length - 2];
      const tweetMessage = textArrayAnswer[textArrayAnswer.length - 1];
      callback(null, tweetId, tweetMessage);
    }
  });
};


// INPUT: the id of the message to reply, the message content and the bot id.
// OUTPUT: the published message Id.
const publishMessage = function(messageId, messageContent, botId, callback) {
  const params = _getParamsItemForPublisher([messageId, messageContent, botId]);
  LOG_EXECUTION_ARGUMENTS && console.log('RUNNING Python.publishMessage: ' + JSON.stringify(params));
  PythonShell.run(PUBLISHER_PY_SCRIPTS.PUBLISH_MESSAGE, params, function(err, textArrayAnswer) {
    if (err) {
      console.log('FAILED Python.publishMessage: ' + err);
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
  teachBot,
  trainModel,
  answerThread,
  linkAccountsToBots,
  listenToTwitterAccount,
  publishMessage,
};

module.exports = pythonService;