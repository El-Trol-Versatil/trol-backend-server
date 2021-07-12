const Bot = require('../models/bot.model.js'),
  Python = require('../providers/scripts/python.service.js');

const initializeBots = function () {
  // TODO. Still nothing needed.
}

const botDaemon = function () {
  // TODO. Still nothing needed.
}

//RUN - Create an array of bots with some parameters
// Returns the list of ids that identifies all the bots in the array
const createBotArray = function(params, callback) {
  const botList = [];
  for (let i = 0, len = params.netsize.value; i < len; i++) {
    createBot(function (err, generatedId) {
      if (!err) {
        botList.push(generatedId);
      } 
    });
  }
  console.log('SUCCESS RUN createBotArray');
  callback(null, botList);
};

//RUN - Train a given bot
const createBot = function(callback) {
  const generatedId = Math.floor(Math.random() * (99999999 - 10000000)) + 10000000;
  Python.createBot(generatedId, function (err, results) {
    if (err) {
      console.log('FAILED RUN createBot ' + generatedId);
      callback(err, null);
    } else {
      let newBot = new Bot({
        id: 'bot' + generatedId,
        botName: 'John Doe ' + generatedId,
        creationDate: new Date(),
        properties: {}
      });
      newBot.save(function (err, bot) {
        if (err) {
          console.log('FAILED RUN createBot ' + newBot.botName);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN createBot ' + newBot.botName);
          callback(null, newBot.id);
        }
      });
    }
  });
};

//RUN - Train a given bot
const trainBotArray = function(botList, callback) {
  botList.forEach(bot => {
    trainBot(bot.id, function (err) {
    });
  });
  console.log('SUCCESS RUN trainBotArray');
  callback(null);
};

//RUN - Train a given bot
const trainBot = function(id, callback) {
  Python.trainBot(id, function (err, results) {
    if (err) {
      console.log('FAILED RUN trainBot ' + id);
      callback(err, null);
    } else {
      Bot.update({ id: id }, { $set: { lastTrained: new Date() } }, function (err) {
        if (err) {
          console.log('FAILED RUN trainBot ' + id);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN trainBot ' + id);
          callback(null, id);
        }
      });
    }
  });
};

const trollnetController = {
  initializeTrollnets,
  trollnetDaemon,
  createBotArray,
  trainBotArray,
};

module.exports = trollnetController;