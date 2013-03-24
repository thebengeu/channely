var Event = require('../models/event').Event
var Channel = require('../models/channel').Channel;

// Endpoint: /channels/:id/events
// Gets all events for a particular channel
exports.index = function (req, res) {
  Event.find({ _channel: req.params.id }, function (err, events) {
      // todo - error handling can be better
      err ? res.send(500, err) : res.json(events);
    })
};

exports.create = function (req, res) {
  Channel.findById(req.body.channelID, function (err, channel) {
    if (!err && !channel) res.send(404, "No such channel exists!");
    else if (err) {
      res.send(500, err);
    } else {
      // todo: date validations (end > start)
      var tmpEvent = new Event({
        name: req.body.name, 
        startDateTime: req.body.startDateTime,
        endDateTime: req.body.endDateTime, 
        details: req.body.details,
        location: [req.body.longtitude, req.body.latitude],
        _channel: channel._id
      });

      tmpEvent.save(function (err) {
        err ? res.send(422, err) : res.send(201, tmpEvent);
      });
    }
  });
};

exports.delete = function (req, res) {
  Event.findById(req.params.id, function (err, evnt) {
      if (!evnt) {
        res.send(404);
      } else {
        evnt.remove(function () {
          res.send(204);
        });
      }
    });
};

var MEAN_RADIUS_OF_EARTH_IN_KM = 6371.009;

exports.search = function (req, res) {
  var query = {};
  if (req.query.longitude && req.query.latitude) {
    query.location = { $nearSphere: [req.query.longitude, req.query.latitude] };
    if (req.query.maxDistance) {
      query.location.$maxDistance = req.query.maxDistance / MEAN_RADIUS_OF_EARTH_IN_KM;
    }
  }
  Event.find(query, function (err, events) {
    err ? res.send(500, err) : res.json(events);
  });
};