var ImagePost = require('../models/imagepost').ImagePost,
    Channel = require('../models/channel').Channel,
    User = require('../models/user').User,
    passport = require('passport');

var fs = require('fs');
var path = require('path');

var PUBLIC_IMAGES_FILE_PATH = '/ebs/public/images/';
var PUBLIC_IMAGES_URL = 'http://upthetreehouse/images/';

exports.index = function (req, res) {
  ImagePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, imagePosts) {
      err ? res.send(500, err) : res.json(imagePosts);
    });
};

exports.create = function (req, res) {
  Channel.findById(req.body.channelID, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!"); }
    else {
      var oldPath = req.files.image.path;
      var baseName = path.basename(oldPath);
      var newPath = path.join(PUBLIC_IMAGES_FILE_PATH, baseName);
      fs.rename(oldPath, newPath, function (err) {
        if (err) {
          res.send(422, err);
        }
        var imageProperties = {
          content: req.body.content,
          url: PUBLIC_IMAGES_URL + baseName,
          _channel: channel._id
        };
        // if there's an access token, get the user and attach it to this post
        // otherwise just save a username     
        if (req.query.access_token) {
          User.findOne({accessToken: req.query.access_token },
            function(err, user){
              if (err || !user) {
                imageProperties.username = req.body.username;
              } else if (user) {
                imageProperties.owner = user._id;
              }

              var imagePost = new ImagePost(imageProperties);
              imagePost.save(function (err) {
                err ? res.send(422, err) : res.send(201, imagePost);
              });  
            });
        } else {
          imageProperties.username = req.body.username;
          var imagePost = new ImagePost(imageProperties);
          imagePost.save(function (err) {
            err ? res.send(422, err) : res.send(201, imagePost);
          });
        }
      });
    }
  });
};


exports.delete = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    ImagePost.findById(req.params.id, function (err, imagePost) {
      if (!imagePost) { res.send(404); }
      else if (imagePost.owner != req.user._id) { res.send(403); }
      else {
        imagePost.remove(function () {
          res.send(204);
        });
      }
    });
  }
];

