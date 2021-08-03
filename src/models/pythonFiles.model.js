const mongoose = require('mongoose');
  
const PythonFilesSchema = mongoose.Schema({
  version:             { type: String,
                         required: true,
                         unique: true },
  creationDate:        { type: Date,
                         required: true },
  modelDescriptorList: { type: String,
                         required: true },
});

module.exports = mongoose.model('PythonFiles', PythonFilesSchema);