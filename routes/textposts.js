var TextPost = require('../models/textpost').TextPost,
    Channel = require('../models/channel').Channel,
    passport = require('passport');

exports.index = function (req, res) {
  TextPost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, textPosts) {
      err ? res.send(500, err) : res.json(textPosts);
    });
}

exports.create = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    Channel.findById(req.body.channelID, function (err, channel) {
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
]

exports.delete = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    TextPost.findById(req.params.id, function (err, textPost) {
      if (!textPost) res.send(404);
      else {
        textPost.remove(function () {
          res.send(204);
        });
      }
    });
  }
]
