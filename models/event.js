var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var eventSchema = new mongoose.Schema({
  _channel: { type: Schema.Types.ObjectId, ref:'Channel' },
  name: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  details: String, 
  // location name (optional?)
  location: { type: [Number], index: '2dsphere' }
});

var eventModel = mongoose.model('Event', eventSchema);

module.exports = {
  Event: eventModel
};
