var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var slidePostSchema = new mongoose.Schema({
  _channel: { type: String, ref:'Channel' },
  _slidesPost: { type: String, ref: 'SlidesPost' },
  time: { type: Date, default: Date.now, index: true },
  url: { type: String, required: true, trim: true },
  thumbUrl: { type: String, required: true, trim: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true }
});

var slidePostModel = mongoose.model('SlidePost', slidePostSchema);

module.exports = {
  SlidePost : slidePostModel
};
