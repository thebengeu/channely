var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var hlsRecordingSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    endSeqNo: { type: Number },
    playlistURL: { type: String, required: true }
});

var hlsRecordingModel = mongoose.model('HLSRecording', hlsRecordingSchema);

module.exports = {
  HLSRecording : hlsRecordingModel
};
