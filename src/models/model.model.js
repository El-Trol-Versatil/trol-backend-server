const mongoose = require('mongoose');
  
const ModelSchema = mongoose.Schema({
  id:            { type: String,
                   required: true,
                   unique: true },
  topic:         { type: String,
                   required: true,
                   unique: true },
  creationDate:  { type: Date,
                   required: true },
  AIObject:      { type: mongoose.Schema.Types.Mixed,
                   required: true },
  keywords:      [{type: String,
                   required: true }],
  lastTrained:   { type: Date },
});

module.exports = mongoose.model('Model', ModelSchema);