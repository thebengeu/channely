var async = require('async');

var ImagePost = require('../models/imagepost').ImagePost;
var TextPost = require('../models/textpost').TextPost;
var Channel = require('../models/channel').Channel;
var HLSRecording = require('../models/hlsrecording').HLSRecording;
var VideoThumbnailPost = require('../models/videothumbnailpost').VideoThumbnailPost;
var SlidesPost = require('../models/slidespost').SlidesPost;
var SlidePost = require('../models/slidepost').SlidePost;

var getPosts = function (req, model, type, callback) {
  var query = {
    _channel: req.params.id
  };
  if (req.query.since || req.query.until) {
    query.time = {};
    if (req.query.since) {
      query.time.$gt = req.query.since;
    }
    if (req.query.until) {
      query.time.$lt = req.query.until;
    }
  }
  model
    .find(query)
    .lean()
    .exec(function(err, posts) {
      if (err) return callback(err);

      callback(null, posts.map(function (post) {
        post.type = type;
        return post;
      }));
    });
}

exports.index = function (req, res) {
  async.parallel([
    function (callback) {
      getPosts(req, TextPost, 'text', callback);
    },
    function (callback) {
      getPosts(req, ImagePost, 'image', callback);
    },
    function (callback) {
      getPosts(req, HLSRecording, 'video', callback);
    },
    function (callback) {
      getPosts(req, VideoThumbnailPost, 'videoThumbnail', callback);
    },
    function (callback) {
      getPosts(req, SlidesPost, 'slides', callback);
    },
    function (callback) {
      getPosts(req, SlidePost, 'slide', callback);
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

