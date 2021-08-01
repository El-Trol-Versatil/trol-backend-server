const mongoose = require('mongoose');
  
const CorpusSchema = mongoose.Schema({
  id:            { type: String,
                   required: true,
                   unique: true },
  name:          { type: String,
                   required: true,
                   unique: true },
  textedJson:    { type: String,
                   required: true },
});

module.exports = mongoose.model('Corpus', CorpusSchema);