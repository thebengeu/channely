var Timeline = require('../models/timeline').Timeline;

// Timeline routes

exports.index = function (req, res) {
    Timeline.find(function (err, timelines) {
      err ? res.send(500, err) : res.json(timelines);
    });
}

exports.show = function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      !timeline ? res.send(404) : res.json(timeline);
    });
}

exports.create = function (req, res) {
    var timeline = new Timeline(req.body);
    timeline.save(function (err) {
      err ? res.send(422, err) : res.send(201, timeline);
    });
}

exports.update = function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      if (!timeline) {
        res.send(404);
      } else {
        timeline.name = req.body.name;
        timeline.save(function (err) {
          err ? res.send(422, err) : res.send(timeline);
        });
      }
    });
}

exports.delete = function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      if (!timeline) {
        res.send(404);
      } else {
        timeline.remove(function () {
          res.send(204);
        });
      }
    });
}
