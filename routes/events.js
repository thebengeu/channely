var Event = require('../models/event').Event,
    Channel = require('../models/channel').Channel,
    passport = require('passport');

// Endpoint: /channels/:id/events
// Gets all events for a particular channel
exports.index = function (req, res) {
  Event.find({ _channel: req.params.id }, function (err, events) {
      // todo - error handling can be better
      err ? res.send(500, err) : res.json(events);
    })
};

exports.create = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    Channel.findById(req.body.channelId, function (err, channel) {
      if (err) { res.send(500, err); }
      else if (!channel) { res.send(404, "No such channel exists!"); }
      else if (channel.owner != req.user._id) { res.send(403); }
      else {
        // todo: date validations (end > start)
        var startDate = req.body.startDateTime;
        var endDate = req.body.endDateTime;
        if (Date.parse(startDate) > Date.parse(endDate)) {
          res.send(422, "Start time cannot be later than end time");
        }
        var tmpEvent = new Event({
          name: req.body.name,
            startDateTime: startDate,
            endDateTime: endDate,
            details: req.body.details,
            location: [req.body.longitude, req.body.latitude],
            _channel: channel._id
        });

        tmpEvent.save(function (err) {
          err ? res.send(422, err) : res.send(201, tmpEvent);
        });
      }
    });
  }
]

exports.delete = [
passport.authenticate('bearer', {session: false}),
  function (req, res) {
    Event.findById(req.params.id, function (err, evnt) {
      if (err) { res.send(500, err); }
      else if (!evnt) { res.send(404); }
      else {
        Channel.findById(evnt._channel, function (err, channel) {
          if (err) { res.send(500, err); }
          else if (!channel) { res.send(422); }
          else if (channel.owner != req.user._id) { res.send(403); }
          else {
            evnt.remove(function() {
              res.send(204);
            });
          }
        });
      }
    });
  }
];

var MEAN_RADIUS_OF_EARTH_IN_M = 6371009.0;

exports.search = function (req, res) {
  var query = {};
  if (req.query.longitude && req.query.latitude) {
    query.location = { $nearSphere: [req.query.longitude, req.query.latitude] };
    if (req.query.maxDistance) {
      query.location.$maxDistance = req.query.maxDistance / MEAN_RADIUS_OF_EARTH_IN_M;
    }
  }
  Event
    .find(query)
    .populate('_channel')
    .lean()
    .exec(function (err, events) {
      events = events.map(function (event) {
        event.longitude = event.location[0];
        event.latitude = event.location[1];
        delete event['location'];
        return event;
      });
      err ? res.send(500, err) : res.json(events);
    });
};
