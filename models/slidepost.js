var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var slidePostSchema = new mongoose.Schema({
  _channel: { type: String, ref:'Channel' },
  time: { type: Date, default: Date.now, index: true },
  content: { type: String, trim: true },
  slideUrls: { type: [String] },
  url: { type: String, required: true, trim: true },
  owner: { type: String, ref: 'User' },
  username: { type: String, default: 'Anonymous' }
});

var slidePostModel = mongoose.model('SlidePost', slidePostSchema);

module.exports = {
  SlidePost : slidePostModel
};
