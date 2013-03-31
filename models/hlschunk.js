var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var hlsChunkSchema = new mongoose.Schema({
  _recording: { type: String, ref:'HLSRecording' },
  duration: { type: Number, required: true },
  filePath: { type: String, required: true },
  seqNo: { type: Number, required: true }
});

var hlsChunkModel = mongoose.model('HLSChunk', hlsChunkSchema);

module.exports = {
  HLSChunk : hlsChunkModel
};
