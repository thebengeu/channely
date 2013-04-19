var ImagePost = require('../models/imagepost').ImagePost,
    Channel = require('../models/channel').Channel,
    User = require('../models/user').User,
    passport = require('passport');

var mv = require('mv');
var path = require('path');
var im = require('imagemagick');

var PUBLIC_IMAGES_FILE_PATH = '/ebs/public/images/';
var PUBLIC_IMAGES_URL = 'http://upthetreehouse.com/images/';

exports.index = function (req, res) {
  ImagePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, imagePosts) {
      err ? res.send(500, err) : res.json(imagePosts);
    });
};

exports.create = function (req, res) {
  Channel.findById(req.params.id, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!"); }
    else {
      var oldPath = req.files.image.path;
      var baseName = path.basename(oldPath);
      var newPath = path.join(PUBLIC_IMAGES_FILE_PATH, baseName);
      mv(oldPath, newPath, function (err) {
        if (err) {
          return res.send(422, err);
        }

        im.identify(['-format', '%wx%h', newPath], function (err, output) {
          if (err) {
            return res.send(422, err);
          }

          var dimensions = output.split('x');

          im.resize({
            srcPath: newPath,
            dstPath: PUBLIC_IMAGES_FILE_PATH + 'thumbs/' + baseName,
            width: 240
          }, function (err, stdout, stderr) {
            if (err) {
              return res.send(422, err);
            }

            var imageProperties = {
              content: req.body.content,
              url: PUBLIC_IMAGES_URL + baseName,
              thumbUrl: PUBLIC_IMAGES_URL + 'thumbs/' + baseName,
              width: +dimensions[0],
              height: +dimensions[1],
              _channel: channel._id
            };

            var token = undefined;

            if (req.headers && req.headers['authorization']) {
              var parts = req.headers['authorization'].split(' ');
              if (parts.length == 2) {
                var scheme = parts[0]
                  , credentials = parts[1];

                if (/Bearer/i.test(scheme)) {
                  token = credentials;
                }
              }
            }

            if (req.body && req.body['access_token']) {
              token = req.body['access_token'];
            }

            if (req.query && req.query['access_token']) {
              token = req.query['access_token'];
            }

            // if there's an access token, get the user and attach it to this post
            // otherwise just save a username
            if (token) {
              User.findOne({accessToken: token },
                function(err, user){
                  if (err || !user) {
                    imageProperties.username = req.body.username;
                  } else if (user) {
                    imageProperties.owner = user._id;
                    imageProperties.username = user.username;
                  }

                  var imagePost = new ImagePost(imageProperties);
                  imagePost.save(function (err) {
                    err ? res.send(422, err) : res.send(201, imagePost);
                  });
                });
            } else {
              if (req.body.username)
                imageProperties.username = req.body.username;

              var imagePost = new ImagePost(imageProperties);
              imagePost.save(function (err) {
                err ? res.send(422, err) : res.send(201, imagePost);
              });
            }
          });
        });
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

