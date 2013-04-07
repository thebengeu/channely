var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var hlsRecordingSchema = new mongoose.Schema({
    _channel: { type: String, ref:'Channel' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    endSeqNo: { type: Number },
    playlistURL: { type: String, required: true },
    time: { type: Date, default: Date.now, index: true },
    owner: { type: String, ref: 'User' },
    username: { type: String, default: 'Anonymous' }
});

var hlsRecordingModel = mongoose.model('HLSRecording', hlsRecordingSchema);

module.exports = {
  HLSRecording : hlsRecordingModel
};
