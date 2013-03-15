var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var timelineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event'}]
});

var timeline = mongoose.model('Timeline', timelineSchema);

module.exports = {
  Timeline: timeline
};
