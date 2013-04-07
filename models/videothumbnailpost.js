var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var videoThumbnailPostSchema = new mongoose.Schema({
  _channel: { type: String, ref:'Channel' },
  _video: { type: String, ref: 'HLSRecording' },
  time: { type: Date, default: Date.now, index: true },
  url: { type: String, required: true, trim: true }
});

var videoThumbnailPostModel = mongoose.model('VideoThumbnailPost', videoThumbnailPostSchema);

module.exports = {
  VideoThumbnailPost : videoThumbnailPostModel
};