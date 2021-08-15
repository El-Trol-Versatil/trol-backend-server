const mongoose = require('mongoose');
  
const TrollnetSchema = mongoose.Schema({            
  customName:       { type: String,
                      required: true },
  genders:          { type: mongoose.Schema.Types.Mixed,
                      required: true },
  ageInterval:      { type: mongoose.Schema.Types.Mixed,
                      required: true },
  ethnicity:        { type: mongoose.Schema.Types.Mixed,
                      required: true },
  culturalLevel:    { type: mongoose.Schema.Types.Mixed,
                      required: true },
  moodLevel:        { type: mongoose.Schema.Types.Mixed,
                      required: true },
  keywords:         { type: mongoose.Schema.Types.Mixed,
                      required: true },
  likes:            { type: mongoose.Schema.Types.Mixed,
                      required: true },
  dislikes:         { type: mongoose.Schema.Types.Mixed,
                      required: true },
  netsize:          { type: mongoose.Schema.Types.Mixed,
                      required: true },
  interactionLevel: { type: mongoose.Schema.Types.Mixed,
                      required: true },
  // targetSelection:  { type: mongoose.Schema.Types.Mixed,
  //                     required: true },
});

module.exports = mongoose.model('Trollnet', TrollnetSchema);