var mv = require('mv');
var path = require('path');

var ImagePost = require('../models/imagepost').ImagePost;
var Channel = require('../models/channel').Channel;

var PUBLIC_IMAGES_FILE_PATH = '/ebs/public/images/';
var PUBLIC_IMAGES_URL = 'http://upthetreehouse/images/';

exports.index = function (req, res) {
  ImagePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, imagePosts) {
      err ? res.send(500, err) : res.json(imagePosts);
    });
};

exports.create = function (req, res) {
  Channel.findById(req.params.id, function (err, channel) {
    if (!err && !channel) res.send(404, "No such channel exists!");
    else if (err) res.send(500, err);
    else {
      var oldPath = req.files.image.path;
      var baseName = path.basename(oldPath);
      var newPath = path.join(PUBLIC_IMAGES_FILE_PATH, baseName);
      mv(oldPath, newPath, function (err) {
        if (err) {
          res.send(422, err);
        }
        var imagePost = new ImagePost({
          content: req.body.content,
          url: PUBLIC_IMAGES_URL + baseName,
          _channel: channel._id
        });
        imagePost.save(function (err) {
          err ? res.send(422, err) : res.send(201, imagePost);
        });
      });
    }
  });
};

exports.delete = function (req, res) {
  ImagePost.findById(req.params.id, function (err, imagePost) {
    if (!imagePost) res.send(404);
    else {
      imagePost.remove(function () {
        res.send(204);
      });
    }
  });
};