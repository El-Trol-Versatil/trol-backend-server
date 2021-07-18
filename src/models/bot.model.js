const mongoose = require('mongoose');
  
const BotSchema = mongoose.Schema({
  id:            { type: String,
                   required: true,
                   unique: true },
  creationDate:  { type: Date,
                   required: true },
  botName:       { type: String,
                   required: true },
  properties:    { type: mongoose.Schema.Types.Mixed,
                   required: true },
  trainedObject: { type: mongoose.Schema.Types.Mixed},
  lastTrained:   { type: Date },
});

module.exports = mongoose.model('Bot', BotSchema);