const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const flatSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: 'Please specify id'
  },
  rent: Number,
  utils: Number,
  finalPrice: Number,
  url: String
});


module.exports = mongoose.model('Flats', flatSchema);