const mongoose = require('mongoose');
  
const CorpusSchema = mongoose.Schema({
  id:          { type: String,
                 required: true,
                 unique: true },
  fileName:    { type: String,
                 required: true,
                 unique: true },
  isNewCorpus: { type: Boolean,
                 required: true },
});

module.exports = mongoose.model('Corpus', CorpusSchema);