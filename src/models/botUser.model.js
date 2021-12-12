const mongoose = require('mongoose');
  
const BotUserSchema = mongoose.Schema({
  botname:     { type: String,
                 required: true },
  twitteruser: { type: String,
                 required: true },
});

module.exports = mongoose.model('bot_user', BotUserSchema);