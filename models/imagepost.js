var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var imagePostSchema = new mongoose.Schema({
  // owner
  _channel: { type: String, ref:'Channel' },
  time: { type: Date, default: Date.now },
  content: { type: String, trim: true },
  url: { type: String, required: true, trim: true }
});

var imagePostModel = mongoose.model('ImagePost', imagePostSchema);

module.exports = {
  ImagePost : imagePostModel
};