const mongoose = require('mongoose');
  
const TrollnetSchema = mongoose.Schema({
  id:          { type: String,
                 required: true,
                 unique: true },
  isActive:    { type: Boolean,
                 required: true },
  properties:  { type: mongoose.Schema.Types.Mixed,
                 required: true },
  botList:    [{ type: String,
                 required: true }],
  status:      { type: String,
                 required: true },
  lastTrained: { type: Date },
});

module.exports = mongoose.model('Trollnet', TrollnetSchema);