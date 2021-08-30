const botController = require('./bot.controller.js');

// It accepts a topic description and an array of members.
// This is the thread starter, which will recursively feed the conversation.
const createConversation = function (topic, members) {
  const dataArray = [topic, members, 0, Math.pow(members.length, 2), null, [], []];
  _followConversation(dataArray, function (conversation) {
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
const _followConversation = function (
      [topic, members, answerIndex, maxAnswers, lastTalker, talkersIndexes, messageArray],
      callback) {
  let memberToReply, messageToReply;
  // 1. random talker from list
  lastTalker = _getRandomDifferentMember(members, lastTalker);
  // 2. answer or reply?
  if (_shouldReplyOrJustAnswer(answerIndex, maxAnswers)) {

    memberToReply = _getRandomDifferentMember(members, lastTalker);
    messageToReply = messageArray[messageArray.length - 1];
  } else {
    memberToReply = null;
  }
  // Generate answer
  _generateAnswer(lastTalker, topic, messageToReply, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _followConversation ' + answerIndex);
    } else {
      console.log('SUCCESS RUN _followConversation ' + answerIndex);
      messageArray.push({
        from: lastTalker,
        to: memberToReply,
        content: answer,
      });
      _saveLastTalker(talkersIndexes, lastTalker);
    }
    if (answerIndex < maxAnswers - 1) {
      answerIndex = answerIndex + 1;
      _followConversation([topic, members, answerIndex++, maxAnswers, lastTalker, talkersIndexes, messageArray]);
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
const _generateAnswer = function (botId, topic, messageToReply, callback) {
  botController.answerThread(botId, topic, messageToReply, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _generateAnswer ' + botId);
      callback(err, null);
    } else {
      console.log('SUCCESS RUN _generateAnswer ' + botId);
      callback(null, answer);
    }
  });
}

// Save last talker as last in queue order.
const _saveLastTalker = function (talkersIndexes, lastTalker) {
  const alreadyTalked = talkersIndexes.indexOf(lastTalker);
  if (alreadyTalked !== -1) {
    talkersIndexes.splice(alreadyTalked, 1);
  }
  talkersIndexes.push(lastTalker);
}

const threadController = {
  createConversation,
};

module.exports = threadController;