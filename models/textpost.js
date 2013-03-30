var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var textPostSchema = new mongoose.Schema({
    _channel: { type: String, ref:'Channel' },
    time: { type: Date, default: Date.now },
    content: { type: String, required: true, trim: true },
    owner: { type: String, ref: 'User' },
    username: { type: String }
});

var textPostModel = mongoose.model('TextPost', textPostSchema);

module.exports = {
  TextPost : textPostModel
};
