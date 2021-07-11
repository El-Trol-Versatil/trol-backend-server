const mongoose = require('mongoose');
  
const TrollnetSchema = mongoose.Schema({
  id:         { type: String,
                required: true,
                unique: true },
  isActive:   { type: Boolean,
                required: true },              
  properties: { type: mongoose.Schema.Types.Mixed,
                required: true }
});

module.exports = mongoose.model('Trollnet', TrollnetSchema);