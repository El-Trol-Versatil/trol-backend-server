const botController = require('./bot.controller.js'),
  Conversation = require('../models/conversation.model.js');


// It accepts a topic description and an array of members.
// This is the thread starter, which will recursively feed the conversation.
const createConversation = function (netId, topic, members) {
  const dataArray = [topic, members, 0, Math.pow(members.length, 2), null, [], []];
  _followConversation(dataArray, function (conversation) {
    if (!conversation) {
      console.log('FAILED RUN createConversation');
    } else {
      let createdConversation = new Conversation({
        trollnetId: netId,
        creationDate: new Date(),
        topic: topic,
        conversation: conversation,
      });
      createdConversation.save(function (err) {
        if (err) {
          console.log('FAILED RUN createConversation ' + topic);
        } else {
          console.log('SUCCESS RUN createConversation ' + topic);
        }
      });
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

    memberToReply = _getRandomDifferentMember(talkersIndexes, lastTalker);
    messageToReply = _getLastMessageFrom(memberToReply, messageArray);
  } else {
    memberToReply = null;
    messageToReply = topic;
  }
  // 3. Generate answer
  console.log('_followConversation ' + lastTalker + ' is thinking an answer...');
  botController.answerThread(lastTalker, messageToReply, function (err, answer) {
    if (err) {
      console.log('FAILED RUN _followConversation ' + answerIndex);
    } else {
      console.log('SUCCESS RUN _followConversation ' + answerIndex);
      messageArray.push({
        from: lastTalker,
        to: memberToReply,
        content: answer,
      });
      console.log('_followConversation ' + lastTalker + ' said to ' + (memberToReply || 'everyone') + ': ' + answer);
      _saveLastTalker(talkersIndexes, lastTalker);
    }
    if (answerIndex < maxAnswers - 1) {
      answerIndex = answerIndex + 1;
      _followConversation([topic, members, answerIndex++, maxAnswers, lastTalker, talkersIndexes, messageArray], callback);
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

const _getLastMessageFrom = function (member, conversation) {
  let message;
  conversation.forEach(element => {
    
  });
  return message;
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