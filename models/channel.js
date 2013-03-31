var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var channelSchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  createdAt: { type: Date, default: Date.now },
  owner: { type: String, ref: 'User', required: true }
});

var channel = mongoose.model('Channel', channelSchema);

module.exports = {
  Channel: channel
};
