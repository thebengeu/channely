var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var textPostSchema = new mongoose.Schema({
    // owner
    _timeline: { type: Schema.Types.ObjectId, ref:'Timeline' },
    time: { type: Date, default: Date.now },
    content: { type: String, required: true, trim: true }
});

var textPostModel = mongoose.model('TextPost', textPostSchema);

module.exports = {
  TextPost : textPostModel
};