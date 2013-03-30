var mongoose = require('mongoose'), 
    Schema = mongoose.Schema;

var imagePostSchema = new mongoose.Schema({
  _channel: { type: String, ref:'Channel' },
  time: { type: Date, default: Date.now },
  content: { type: String, trim: true },
  url: { type: String, required: true, trim: true },
  owner: { type: String, ref: 'User' },
  username: { type: String }
});

var imagePostModel = mongoose.model('ImagePost', imagePostSchema);

module.exports = {
  ImagePost : imagePostModel
};
