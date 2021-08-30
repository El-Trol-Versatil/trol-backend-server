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

const _getRandomParams = function(params) {
  // // // TODO: HILAR FINO - do not override, use real values input
  params = {
    ageInterval: { values: {lower: 18, upper: 55} },
    genders: { values: ['1', '2'] },
    ethnicity: { values: ['2', '3'] },
    culturalLevel: { values: {lower: 0, upper: 2} },
    moodLevel: { values: {lower: -2, upper: 2} },
    keywords: { values: ['música', 'medios de transporte', 'fútbol', 'comida', 'política', 'viajes'] },
    likes: { values: ['Beethoven', 'carne', 'Real Madrid', 'coches', 'derecha', 'playa'] },
    dislikes: { values: ['Mozart', 'pescado', 'Barcelona', 'motos', 'izquierda', 'montaña'] },
    interactionLevel: { values: {lower: 2, upper: 3} },
  };
  // // //

  const moodLevel = Utils.randomIntegerInInterval(params.moodLevel.values.lower, params.moodLevel.values.upper),
    moodCoef = Utils.getIntervalPortion(moodLevel, params.moodLevel.values.lower, params.moodLevel.values.upper),
    kwToLikes = [], kwToDislikes = [], finalLikes = [], finalDislikes = [];
  // Will split keywords into likes and dislikes proportionally to mood level.
  // Will calculate final likes and dislikes by extending them with these values.
  Utils.splitRandomlyByCoef(params.keywords.values, moodCoef, kwToLikes, kwToDislikes);
  // Will calculate final likes by getting a portion of likes and kwToLikes. We ignore the remaining elements.
  Utils.splitRandomlyByCoef([...params.likes.values, ...kwToLikes], moodCoef, finalLikes, []);
  // Will calculate final dislikes by getting a portion of dislikes and kwToDislikes. We ignore the remaining elements.
  Utils.splitRandomlyByCoef([...params.dislikes.values, ...kwToDislikes], 1 - moodCoef, finalDislikes, []);

  return randomParams = {
    age: Utils.randomIntegerInInterval(params.ageInterval.values.lower, params.ageInterval.values.upper),
    gender: Utils.randomElementFromArray(params.genders.values),
    ethnicity: Utils.randomElementFromArray(params.ethnicity.values),
    culturalLevel: Utils.randomIntegerInInterval(params.culturalLevel.values.lower, params.culturalLevel.values.upper),
    interactionLevel: Utils.randomIntegerInInterval(params.interactionLevel.values.lower, params.interactionLevel.values.upper),
    likes: finalLikes,
    dislikes: finalDislikes,
  };
}

//RUN - Train a given bot
const _createBot = function(params, callback) {
  const generatedId = 'bot' + Utils.generateId();
  Python.createBot(
    params.age,
    params.culturalLevel,
    params.likes,
    params.dislikes, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _createBot ' + generatedId);
      callback(err, null);
    } else {
      let newBot = new Bot({
        id: generatedId,
        botName: 'Name' + generatedId,
        creationDate: new Date(),
        AIObject: answer,
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
  _getBotFromDB(id, function (bot) {
    if (!bot) {
      console.log('FAILED RUN _teachBot no bot in DB with id ' + id);
      callback(err);
    } else {
      Python.teachBot(bot.AIObject, modelDescriptorList, function (err, answer) {
        if (err) {
          console.log('FAILED RUN _teachBot ' + id);
          callback(err);
        } else {
          Bot.update({ id }, {
            $set: {
              lastTrained: new Date(),
              AIObject: answer
            }
          }, function (err) {
            if (err) {
              console.log('FAILED RUN _teachBot ' + id);
              callback(err);
            } else {
              console.log('SUCCESS RUN _teachBot ' + id);
              callback(null);
            }
          });
        }
      });
    }
  });
};

//RUN - Ask a bot for a conversation message
const answerThread = function(botId, thread, messageToReply, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      console.log('FAILED RUN answerThread no bot in DB with id ' + botId);
      callback(err, null);
    } else {
      const botFilterParams = _getFilterParams(bot.properties.interactionLevel);
      Python.answerThread(bot.AIObject, thread, botFilterParams, messageToReply, function (err, answer) {
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

const MessageParams = {
  MaxInteractionLevel: 5,
  MaxCharacters: 280,
  PossibleAnswersNumber: 100, 
 };
 
 const _getFilterParams = function (interactionLevel) {
   return [
      '-nc',
      Math.round(MessageParams.MaxCharacters * (interactionLevel / MessageParams.MaxInteractionLevel)),
      '-nor',
      MessageParams.PossibleAnswersNumber
   ];
 }

const botController = {
  createBotArray,
  teachBotArray,
  answerThread,
};

module.exports = botController;