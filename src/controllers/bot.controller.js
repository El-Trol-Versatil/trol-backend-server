const Bot = require('../models/bot.model.js'),
  ModelController = require('./model.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  Utils = require('../helpers/utils.helper.js');

const _getBotFromDB = function(id, callback) {
  Bot.findOne({ id: id }, function (err, bot) {
    if (err) {
      console.log('FAILED _getBotFromDB with id ' + id);
      callback(null);
    } else {
      callback(bot.toObject());
    }
  });
};

//RUN - Create an array of bots with some parameters
// Returns the list of ids that identifies all the bots in the array
const createBotArray = function(params, callback) {
  const botList = [],
    totalBots = params.netsize.value;
  _followBotCreation(botList, 0, totalBots, params, function () {
    console.log('SUCCESS RUN createBotArray');
    callback(null, botList);
  });
};

// Recursive method that will call itself for each following bot to be created in the array.
const _followBotCreation = function(botList, botIndex, totalBots, params, callback) {
  _createBot(_getRandomParams(params), function (err, generatedId) {
    if (!err) {
      botList.push(generatedId);
    }
    if (botIndex < totalBots - 1) {
      botIndex = botIndex + 1;
      _followBotCreation(botList, botIndex, totalBots, params, callback);
    } else {
      callback();
    };
  });
}

const _getRandomParams = function(params, callback) {
  // // // TODO: HILAR FINO - do not override, use real values input
  params = {
    ageInterval: { values: [18, 55] },
    culturalLevel: { values: [0, 2] },
    keywords: { values: ['Tokio', 'La Casa de Papel', 'El Árbol De La Sangre'] },
    likes: { values: ['Real Madrid', 'Beethoven', 'Miel'] },
    dislikes: { values: ['Barcelona', 'Mozart', 'Jalea'] },
  };
  // // //

  const fieldsToRandomize = [
    // 'genders',
    'ageInterval',
    // 'ethnicity',
    'culturalLevel',
    'keywords',
    'likes',
    'dislikes',
  ], randomParams = {};
  fieldsToRandomize.forEach(field => {
    const values = params[field].values,
      randomResults = values[0] instanceof String
      ? Utils.randomStrings(values)
      : Utils.roundedRandomNumber(values.lower, values.upper)
    randomParams[field] = randomResults;
  });
  return randomParams;
}

//RUN - Train a given bot
const _createBot = function(params, callback) {
  const generatedId = Utils.generateId();
  Python.createBot(
    params.age,
    params.educationLevel,
    params.likes,
    params.dislikes, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _createBot ' + generatedId);
      callback(err, null);
    } else {
      let newBot = new Bot({
        id: 'bot' + generatedId,
        botName: 'Name' + generatedId,
        creationDate: new Date(),
        botObject: answer,
        properties: params,
      });
      newBot.save(function (err, bot) {
        if (err) {
          console.log('FAILED RUN _createBot ' + generatedId);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN _createBot ' + generatedId);
          callback(null, generatedId);
        }
      });
    }
  });
};

//RUN - Train a given bot
const teachBotArray = function(botList, callback) {
  ModelController.getModelDescriptorListFromDB(function (modelDescriptorList) {
    _followBotTeaching(botList, 0, botList.length, modelDescriptorList, function () {
      console.log('SUCCESS RUN teachBotArray');
      callback(null);
    });
  });
};

// Recursive method that will call itself for each following bot to be taught in the array.
const _followBotTeaching = function(botList, botIndex, totalBots, modelDescriptorList, callback) {
  const botId = botList[botIndex];
  _teachBot(botId, modelDescriptorList, function (err) {
    if (botIndex < totalBots - 1) {
      botIndex = botIndex + 1;
      _followBotTeaching(botList, botIndex, totalBots, modelDescriptorList, callback);
    } else {
      callback();
    };
  });
}

//RUN - Teach a given bot about what he likes and dislikes
const _teachBot = function(id, modelDescriptorList, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      callback(err);
      console.log('FAILED RUN _teachBot no bot in DB with id ' + id);
    } else {
      Python.teachBot(bot.AIObject, modelDescriptorList, function (err, answer) {
        if (err) {
          console.log('FAILED RUN _teachBot ' + id + ' in ' + model.topic);
          callback(err);
        } else {
          Bot.update({ id }, {
            $set: {
              lastTrained: new Date(),
              AIObject: answer
            }
          }, function (err) {
            if (err) {
              console.log('FAILED RUN _teachBot ' + id + ' in ' + model.topic);
              callback(err);
            } else {
              console.log('SUCCESS RUN _teachBot ' + id + ' in ' + model.topic);
              callback(null);
            }
          });
        }
      });
    }
  });
};

//RUN - Ask a bot for a conversation message
const answerThread = function(botId, thread, filterParams, messageToReply, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      console.log('FAILED RUN answerThread no bot in DB with id ' + botId);
      callback(err, null);
    } else {
      Python.answerThread(bot.AIObject, thread, filterParams, messageToReply, function (err, answer) {
        if (err) {
          console.log('FAILED RUN answerThread ' + botId);
          callback(err, null);
        } else {
          console.log('SUCCESS RUN answerThread ' + botId);
          callback(null, answer)
        }
      });
    }
  });
}

const botController = {
  createBotArray,
  teachBotArray,
  answerThread,
};

module.exports = botController;