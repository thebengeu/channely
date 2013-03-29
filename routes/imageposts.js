var ImagePost = require('../models/imagepost').ImagePost;
var Channel = require('../models/channel').Channel;

exports.index = function (req, res) {
  ImagePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, imagePosts) {
      err ? res.send(500, err) : res.json(imagePosts);
    });
}

exports.create = function (req, res) {
  Channel.findById(req.body.channelID, function (err, channel) {
    if (!err && !channel) res.send(404, "No such channel exists!");
    else if (err) res.send(500, err);
    else {
      var imagePost = new ImagePost({
        content: req.body.content,
        url: req.body.url,
        _channel: channel._id
      });
      imagePost.save(function (err) {
        err ? res.send(422, err) : res.send(201, imagePost);
      });
    }
  });
}

exports.delete = function (req, res) {
  ImagePost.findById(req.params.id, function (err, imagePost) {
    if (!imagePost) res.send(404);
    else {
      imagePost.remove(function () {
        res.send(204);
      });
    }
  });
}