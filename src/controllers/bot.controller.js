const Bot = require('../models/bot.model.js'),
  BotUser = require('../models/botUser.model.js'),
  ModelController = require('./model.controller.js'),
  Python = require('../providers/scripts/python.service.js'),
  trollnetHelper = require('../helpers/trollnet.helper.js'),
  Utils = require('../helpers/utils.helper.js');

  const MessageParams = {
    MaxInteractionLevel: 5,
    MaxCharacters: 280,
    PossibleAnswersNumber: 20, 
   };

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
const createBotArray = function(trollnetId, params, callback) {
  console.log('RUNNING createBotArray');
  const botList = [],
    totalBots = params.netsize.value;
  _followBotCreation(trollnetId, botList, 0, totalBots, params, function (err) {
    if (err) {
      console.log('FAILURE createBotArray');
      callback(err);
    } else {
      console.log('SUCCESS createBotArray');
      callback(null, botList);
    }
  });
};

// Recursive method that will call itself for each following bot to be created in the array.
const _followBotCreation = function(trollnetId, botList, botIndex, totalBots, params, callback) {
  _createBot(_getRandomParams(params), function (err, generatedId) {
    if (err) {
      callback(err);
    } else {
      if (!err) {
        botList.push(generatedId);
      }
      botIndex = botIndex + 1;
      let percentualProgress = Math.floor((botIndex / totalBots) * 100);
      trollnetHelper.updateCreationStatus(trollnetId, percentualProgress);
      if (botIndex < totalBots) {
        _followBotCreation(trollnetId, botList, botIndex, totalBots, params, callback);
      } else {
        callback();
      };
    }
  });
}

const _getRandomParams = function(params) {
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
  console.log('RUNNING _createBot ' + generatedId);
  Python.createBot(
    params.age,
    params.culturalLevel,
    params.likes,
    params.dislikes, function (err, answer) {
    if (err) {
      callback('FAILED _createBot ' + generatedId + ': ' + err, null);
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
          console.log('FAILED to save _createBot ' + generatedId);
          callback(err, null);
        } else {
          callback(null, generatedId);
        }
      });
    }
  });
};

//RUN - Train a given bot
const teachBotArray = function(trollnetId, botList, callback) {
  console.log('RUNNING teachBotArray');
  ModelController.getModelDescriptorListFromDB(function (modelDescriptorList) {
    _followBotTeaching(trollnetId, botList, 0, botList.length, modelDescriptorList, function (err) {
      if (err) {
        console.log('FAILURE teachBotArray');
        callback(err);
      } else {
        console.log('SUCCESS teachBotArray');
        callback(null);
      }
    });
  });
};

// Recursive method that will call itself for each following bot to be taught in the array.
const _followBotTeaching = function(trollnetId, botList, botIndex, totalBots, modelDescriptorList, callback) {
  const botId = botList[botIndex];
  _teachBot(botId, modelDescriptorList, function (err) {
    if (err) {
      callback(err);
    } else {
      botIndex = botIndex + 1;
      let percentualProgress = Math.floor((botIndex / totalBots) * 100);
      trollnetHelper.updateTrainingStatus(trollnetId, percentualProgress);
      if (botIndex < totalBots) {
        _followBotTeaching(trollnetId, botList, botIndex, totalBots, modelDescriptorList, callback);
      } else {
        callback();
      };
    }
  });
}

//RUN - Teach a given bot about what he likes and dislikes
const _teachBot = function(id, modelDescriptorList, callback) {
  console.log('RUNNING _teachBot ' + id);
  _getBotFromDB(id, function (bot) {
    Python.teachBot(bot.AIObject, modelDescriptorList, function (err, answer) {
      if (err) {
        callback('FAILED teachBot ' + id + ': ' + err);
      } else {
        Bot.update({ id }, {
          $set: {
            lastTrained: new Date(),
            AIObject: answer
          }
        }, function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      }
    });
  });
};

//RUN - Delete an array of bots
const deleteBotArray = function(botList, callback) {
  console.log('RUNNING deleteBotArray');
  Bot.deleteMany({ id: { $in: botList }}, function(err) {
    if (err) {
      console.log('FAILURE deleteBotArray');
      callback(err);
    } else {
      BotUser.deleteMany({ botname: { $in: botList }}, function(err) {
        if (err) {
          console.log('FAILURE deleteBotArray');
          callback(err);
        } else {
          console.log('SUCCESS deleteBotArray');
          callback(null);
        }
      });
    }
  });
};


//RUN - Ask a bot for a conversation message
const answerThread = function(messageToReplyId, messageToReplyContent, botId, callback) {
  _getBotFromDB(botId, function (bot) {
    if (!bot) {
      callback(err, null);
    } else {
      const botFilterParams = _getFilterParams(bot.properties.interactionLevel);
      Python.answerThread(bot.AIObject, messageToReplyContent, botFilterParams, function (err, answer) {
        if (err) {
          callback(err, null);
        } else {
          Python.publishMessage(messageToReplyId, answer, botId, function (err, publishId) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, {content: answer, id: publishId});
            }
          });
        }
      });
    }
  });
}
 
 const _getFilterParams = function (interactionLevel) {
   return [
      '-nc',
      Math.round(MessageParams.MaxCharacters * Math.max(2/5, (interactionLevel / MessageParams.MaxInteractionLevel))),
      '-nor',
      MessageParams.PossibleAnswersNumber
   ];
 }

const botController = {
  createBotArray,
  teachBotArray,
  deleteBotArray,
  answerThread,
};

module.exports = botController;