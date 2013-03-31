var TextPost = require('../models/textpost').TextPost;
var Channel = require('../models/channel').Channel;

exports.index = function (req, res) {
  TextPost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, textPosts) {
      err ? res.send(500, err) : res.json(textPosts);
    });
}

exports.create = function (req, res) {
  Channel.findById(req.params.id, function (err, channel) {
    if (!err && !channel) res.send(404, "No such channel exists!");
    else if (err) res.send(500, err);
    else {
      var textPost = new TextPost({
        content: req.body.content,
        _channel: channel._id
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