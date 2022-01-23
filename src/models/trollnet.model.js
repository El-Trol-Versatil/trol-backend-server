const mongoose = require('mongoose');
  
const TrollnetSchema = mongoose.Schema({
  id:             { type: String,
                    required: true,
                    unique: true },
  isActive:       { type: Boolean,
                    required: true },
  properties:     { type: mongoose.Schema.Types.Mixed,
                    required: true },
  botList:       [{ type: String,
                    required: true }], 
  creationStatus: { type: Number,
                    required: true },
  trainingStatus: { type: Number,
                    required: true },
  lastTrained:    { type: Date },
  error:          { type: String },
});

module.exports = mongoose.model('Trollnet', TrollnetSchema);