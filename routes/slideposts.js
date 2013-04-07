var SlidePost = require('../models/slidepost').SlidePost,
  Channel = require('../models/channel').Channel,
  User = require('../models/user').User,
  exec = require('child_process').exec,
  fs = require('fs'),
  passport = require('passport');

var mv = require('mv');
var path = require('path');

var PUBLIC_SLIDES_FILE_PATH = '/ebs/public/slides/';
var PUBLIC_SLIDES_URL = 'http://upthetreehouse.com/slides/';

exports.index = function (req, res) {
  SlidePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, slidePosts) {
      err ? res.send(500, err) : res.json(slidePosts);
    });
};

exports.create = function (req, res) {
  Channel.findById(req.params.id, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!"); }
    else {
      var slidePost = new SlidePost({
        _channel: channel._id,
        content: req.body.content
      });
      var oldPath = req.files.slide.path;
      var baseName = req.files.slide.name;
      var extension = path.extname(baseName);
      var newDir = path.join(PUBLIC_SLIDES_FILE_PATH, slidePost.id);
      var newPath = path.join(newDir, baseName);

      if (extension === '.pdf') {
        fs.mkdir(newDir, function (err) {
          if (err) return res.send(422, err);

          mv(oldPath, newPath, function (err) {
            if (err) return res.send(422, err);

            var baseUrl = PUBLIC_SLIDES_URL + slidePost.id + '/';
            slidePost.url = baseUrl + baseName;

            exec('pdftoppm -jpeg -scale-to 1024 ' + newPath + ' slide', {
              cwd: newDir
            }, function (error, stdout, stderr) {
              if (error) return res.send(422, err);

              fs.readdir(newDir, function (err, files) {
                if (error) return res.send(422, err);

                slidePost.slideUrls = files.filter(function (file) {
                  return path.extname(file) === '.jpg';
                }).map(function (file) {
                    return baseUrl + file;
                  });

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
                        slidePost.username = req.body.username;
                      } else if (user) {
                        slidePost.owner = user._id;
                        slidePost.username = user.username;
                      }

                      slidePost.save(function (err) {
                        err ? res.send(422, err) : res.send(201, slidePost);
                      });
                    });
                } else {
                  if (req.body.username)
                    slidePost.username = req.body.username;

                  slidePost.save(function (err) {
                    err ? res.send(422, err) : res.send(201, slidePost);
                  });
                }
              })
            });
          });
        });
      } else {
        res.send(500, 'Unexpected slides extension');
      }
    }
  });
};


exports.delete = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    SlidePost.findById(req.params.id, function (err, slidePost) {
      if (!slidePost) { res.send(404); }
      else if (slidePost.owner != req.user._id) { res.send(403); }
      else {
        slidePost.remove(function () {
          res.send(204);
        });
      }
    });
  }
];

