const Bot = require('../models/bot.model.js'),
  botController = require('./bot.controller.js');

const threadDaemon = function () {
  // TODO. Still nothing needed.
}

// It accepts a topic description and an array of members.
// This is the thread starter, which will recursively feed the conversation.
const createConversation = function (topic, members) {
  const dataArray = [topic, members, 0, (members.length)^2, null, []];
  followConversation(dataArray, function (conversation) {
    if (!conversation) {
      console.log('FAILED RUN createConversation');
    } else {
      console.log('SUCCESS RUN createConversation');
      callback(conversation);
    }
  });
}

// Accepts an array of data needed for every conversation step.
// Recursive method that will call itself for each following answer in the thread.
const followConversation = function (
      [topic, members, answerIndex, maxAnswers, lastTalker, messageArray],
      callback) {
  let nextReceiver;
  // 1. random talker from list
  lastTalker = _getRandomDifferentMember(members, lastTalker);
  // 2. answer or reply?
  if (_shouldReplyOrJustAnswer(answerIndex, maxAnswers)) {
    nextReceiver = _getRandomDifferentMember(members, lastTalker);
  } else {
    nextReceiver = null;
  }
  // Generate answer
  _generateAnswer(lastTalker, topic, type, function (err, answer) {
    if (err) {
      console.log('FAILED RUN followConversation ' + answerIndex);
    } else {
      console.log('SUCCESS RUN followConversation ' + answerIndex);
      messageArray.push({
        from: lastTalker,
        to: nextReceiver,
        content: answer,
      });
    }
    if (answerIndex < maxAnswers) {
      followConversation([topic, members, answerIndex++, maxAnswers, lastTalker, messageArray]);
    } else {
      callback(messageArray);
    };
  });
}

// It accepts the list of members and a specific one that must not be chosen.
// Returns a random member different than the last one.
const _getRandomDifferentMember = function (members, memberToAvoid) {
  const list = members.slice();
  if (memberToAvoid) {
    const indexToRemove = list.indexOf(memberToAvoid);
    list.splice(indexToRemove, 1);
  }
  let randomIndex = Math.trunc(Math.random() * list.length);
  return list[randomIndex];
}

// The more answers, the higher the chance to reply.
const _shouldReplyOrJustAnswer = function (answerIndex, maxAnswers) {
  const replyChance = Math.sqrt(answerIndex/maxAnswers);
  return willReply = Math.random() < replyChance;
}

// It accepts the topic about which we want an answer.
const _generateAnswer = function (botId, topic, type) {
  botController.answerThread(botId, topic, type, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _generateAnswer ' + botId);
      callback(null);
    } else {
      console.log('SUCCESS RUN _generateAnswer ' + botId);
      callback(answer);
    }
  });
}

const threadController = {
  threadDaemon,
  createConversation,
};

module.exports = threadController;