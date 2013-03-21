var Event = require('../models/event').Event
var Timeline = require('../models/timeline').Timeline;

// Endpoint: /timelines/:id/events
// Gets all events for a particular timeline
exports.index = function (req, res) {
  Timeline.findById(req.params.id).populate('events')
    .exec(function (err, timeline) {
      // todo - error handling can be better
      err ? res.send(500, err) : res.json(timeline.events);
    })
}

exports.create = function (req, res) {
  Timeline.findById(req.body.timelineID, function (err, timeline) {
    if (!err && !timeline) res.send(404, "No such timeline exists!");
    else if (err) {
      res.send(500, err);
    } else {
      // todo: date validations (end > start)
      var tmpEvent = new Event({
        name: req.body.name, 
        startDateTime: req.body.startDateTime,
        endDateTime: req.body.endDateTime, 
        details: req.body.details,
        _timeline: timeline._id
      });

      tmpEvent.save(function (err) {
        err ? res.send(422, err) : res.send(201, tmpEvent);
      });
    }
  });
}

exports.delete = function (req, res) {
  Event.findById(req.params.id)
    .populate('_timeline')
    .exec(function (err, evnt) {
      if (!evnt) {
        res.send(404);
      } else {
       
        // delete event object
        evnt.remove(function () {
          res.send(204);
        });
      }
    });
}
