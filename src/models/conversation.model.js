const mongoose = require('mongoose');
  
const ConversationSchema = mongoose.Schema({
  creationDate:  { type: Date,
                   required: true },
  trollnetId:    { type: String,
                   required: true },
  topic:         { type: String,
                   required: true },
  conversation:  { type: mongoose.Schema.Types.Mixed,
                   required: true },
});

module.exports = mongoose.model('Conversation', ConversationSchema);