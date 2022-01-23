const botController = require('./bot.controller.js'),
  Conversation = require('../models/conversation.model.js');


// It accepts a topic description and an array of members.
// This is the thread starter, which will recursively feed the conversation.
const createConversation = function (netId, topicContent, topicId, members) {
  console.log('RUNNING createConversation ' + topicContent);
  const dataArray = [topicContent, topicId, members, 0, Math.pow(members.length, 2), null, [], []];
  _followConversation(dataArray, function (conversation) {
    console.log('FINISHED createConversation ' + topicContent);
    let createdConversation = new Conversation({
      trollnetId: netId,
      creationDate: new Date(),
      topic: topicContent,
      topicId: topicId,
      conversation: conversation,
    });
    createdConversation.save(function (err) {
      if (err) {
        console.log('FAILED to save conversation ' + topic);
      }
    });
  });
}

// Accepts an array of data needed for every conversation step.
// Recursive method that will call itself for each following answer in the thread.
const _followConversation = function (
      [topicContent, topicId, members, answerIndex, maxAnswers, lastTalker, talkersIndexes, messageArray],
      callback) {
  let memberToReply, messageToReply, messageToReplyContent, messageToReplyId;
  // 1. random talker from list
  lastTalker = _getRandomDifferentMember(members, lastTalker);
  // 2. answer or reply?
  if (_shouldReplyOrJustAnswer(answerIndex, maxAnswers)) { 
    memberToReply = _getRandomDifferentMember(talkersIndexes, lastTalker);
    messageToReply = _getLastMessageFrom(memberToReply, messageArray);
    messageToReplyContent = messageToReply && messageToReply.content || topicContent;
    messageToReplyId = messageToReply && messageToReply.id || topicId;
  } else {
    memberToReply = null;
    messageToReplyContent = topicContent;
    messageToReplyId = topicId;
  }
  // 3. Generate answer
  console.log('_followConversation ' + lastTalker + ' is thinking an answer...');
  botController.answerThread(messageToReplyId, messageToReplyContent, lastTalker, function (err, answer) {
    if (err) {
      console.log('FAILED _followConversation bot could not answer :( ' + answerIndex);
    } else {
      messageArray.push({
        from: lastTalker,
        to: memberToReply,
        content: answer.content,
        id: answer.id,
      });
      console.log('_followConversation ' + lastTalker + ' said to ' + (memberToReply || 'everyone') + ': ' + answer.content);
      _saveLastTalker(talkersIndexes, lastTalker);
    }
    if (answerIndex < maxAnswers - 1) {
      answerIndex = answerIndex + 1;
      _followConversation([topicContent, topicId, members, answerIndex++, maxAnswers, lastTalker, talkersIndexes, messageArray], callback);
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
  const randomIndex = Math.trunc(Math.random() * list.length);
  return list[randomIndex];
}

// The more answers, the higher the chance to reply.
const _shouldReplyOrJustAnswer = function (answerIndex, maxAnswers) {
  const replyChance = Math.sqrt(answerIndex/maxAnswers);
  return willReply = Math.random() < replyChance;
}

const _getLastMessageFrom = function (member, conversation) {
  let possibleMessages = [];
  conversation.forEach(conversationMessage => {
    if (conversationMessage.from === member) {
      possibleMessages.push(conversationMessage);
    }
  });
  const randomIndex = Math.trunc(Math.random() * possibleMessages.length);
  return possibleMessages[randomIndex];
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