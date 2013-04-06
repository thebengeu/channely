var async = require('async');

var ImagePost = require('../models/imagepost').ImagePost;
var TextPost = require('../models/textpost').TextPost;
var Channel = require('../models/channel').Channel;
var HLSRecording = require('../models/hlsrecording').HLSRecording;

exports.index = function (req, res) {
  async.parallel([
    function (callback) {
      TextPost
        .find({ _channel: req.params.id })
        .lean()
        .exec(function(err, textPosts) {
          if (err) return callback(err);

          callback(null, textPosts.map(function (textPost) {
            textPost.type = 'text';
            return textPost;
          }));
        });
    },
    function (callback) {
      ImagePost
        .find({ _channel: req.params.id })
        .lean()
        .exec(function(err, imagePosts) {
          if (err) return callback(err);

          callback(null, imagePosts.map(function (imagePost) {
            imagePost.type = 'image';
            return imagePost;
          }));
        });
    },
    function (callback) {
      HLSRecording
        .find({ _channel: req.params.id })
        .lean()
        .exec(function(err, videoPosts) {
          if (err) return callback(err);

          callback(null, videoPosts.map(function (videoPost) {
            videoPost.type = 'video';
            return videoPost;
          }));
        });
    }
  ], function (err, results) {
    if (err) {
      res.send(500, err);
    } else {
      var posts = [];
      posts = posts.concat.apply(posts, results);

      posts.sort(function compare (a, b) {
        var dateA = a.time;
        var dateB = b.time;
        return dateA < dateB ? -1 : (dateA > dateB ? 1 : 0);
      });

      res.json(posts);
    }
  });
};

