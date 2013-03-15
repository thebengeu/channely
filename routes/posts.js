var TextPost = require('../models/textpost').TextPost;
var Timeline = require('../models/timeline').Timeline;

exports.index = function (req, res) {
  TextPost.find({ _timeline: req.params.id },
      function(err, textPosts) {
        err ? res.send(500, err) : res.json(textPosts);
      });
}

exports.create = function (req, res) {
  Timeline.findById(req.body.timelineID, function (err, timeline) {
    if (!err && !timeline) res.send(404, "No such timeline exists!");
    else if (err) res.send(500, err);
    else {
      var textPost = new TextPost({
        content: req.body.content,
        _timeline: timeline._id
      });
      textPost.save(function (err) {
        err ? res.send(422, err) : res.send(201, textPost);
      });
    }
  });
}

exports.delete = function (req, res) {
    TextPost.findById(req.params.id, function (err, textPost) {
      if (!textPost) res.send(404);
      else {
        textPost.remove(function () {
          res.send(204);
        });
      }
    });
}
