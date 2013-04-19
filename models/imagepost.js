var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;

var imagePostSchema = new mongoose.Schema({
  _channel: { type: String, ref:'Channel' },
  time: { type: Date, default: Date.now, index: true },
  content: { type: String, trim: true },
  url: { type: String, required: true, trim: true },
  thumbUrl: { type: String, required: true, trim: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  owner: { type: String, ref: 'User' },
  username: { type: String, default: 'Anonymous' }
});

var imagePostModel = mongoose.model('ImagePost', imagePostSchema);

module.exports = {
  ImagePost : imagePostModel
};
