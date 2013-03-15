var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var eventSchema = new mongoose.Schema({
  _timeline: { type: Schema.Types.ObjectId, ref:'Timeline' },
  name: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  details: String, 
});

var eventModel = mongoose.model('Event', eventSchema);

module.exports = {
  Event: eventModel
};
