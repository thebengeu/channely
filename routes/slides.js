var SlidePost = require('../models/slidepost').SlidePost,
  SlidesPost = require('../models/slidespost').SlidesPost,
  Channel = require('../models/channel').Channel,
  User = require('../models/user').User,
  exec = require('child_process').exec,
  fs = require('fs'),
  passport = require('passport');

var async = require('async');
var mv = require('mv');
var path = require('path');

var PUBLIC_SLIDES_FILE_PATH = '/Users/beng/ebs/public/slides/';
var PUBLIC_SLIDES_URL = 'http://upthetreehouse.com/slides/';

exports.index = function (req, res) {
  SlidePost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, slidePosts) {
      err ? res.send(500, err) : res.json(slidePosts);
    });
};

var savePosts = function(slidesPost, channel, files, baseUrl, callback) {
  slidesPost.save(function (err) {
    if (err) return callback(err);

    async.each(files.filter(function (file) {
      return path.extname(file) === '.jpg';
    }), function(slideImageFile, cb) {
      var slidePost = new SlidePost({
        _channel: channel._id,
        _slidesPost: slidesPost._id,
        url: baseUrl + slideImageFile
      });
      slidePost.save(function (err) {
        cb(err);
      });
    }, function (err) {
      callback(err, slidesPost);
    });
  });
};

exports.create = function (req, res) {
  Channel.findById(req.params.id, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!"); }
    else {
      var slidesPost = new SlidesPost({
        _channel: channel._id,
        content: req.body.content
      });
      var oldPath = req.files.slide.path;
      var baseName = req.files.slide.name;
      var extension = path.extname(baseName);
      var newDir = path.join(PUBLIC_SLIDES_FILE_PATH, slidesPost.id);
      var newPath = path.join(newDir, baseName);

      if (extension === '.pdf') {
        fs.mkdir(newDir, function (err) {
          if (err) return res.send(422, err);

          mv(oldPath, newPath, function (err) {
            if (err) return res.send(422, err);

            var baseUrl = PUBLIC_SLIDES_URL + slidesPost.id + '/';
            slidesPost.url = baseUrl + baseName;

            exec('pdftoppm -jpeg -scale-to 1024 ' + newPath + ' slide', {
              cwd: newDir
            }, function (error, stdout, stderr) {
              if (error) return res.send(422, err);

              fs.readdir(newDir, function (err, files) {
                if (error) return res.send(422, err);

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
                        slidesPost.username = req.body.username;
                      } else if (user) {
                        slidesPost.owner = user._id;
                        slidesPost.username = user.username;
                      }

                      savePosts(slidesPost, channel, files, baseUrl, function (err, slidesPost) {
                        err ? res.send(422, err) : res.send(201, slidesPost);
                      });
                    });
                } else {
                  if (req.body.username)
                    slidesPost.username = req.body.username;

                  savePosts(slidesPost, channel, files, baseUrl, function (err, slidesPost) {
                    err ? res.send(422, err) : res.send(201, slidesPost);
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
    SlidesPost.findById(req.params.id, function (err, slidesPost) {
      if (!slidesPost) { res.send(404); }
      else if (slidesPost.owner != req.user._id) { res.send(403); }
      else {
        slidesPost.remove(function () {
          res.send(204);
        });
      }
    });
  }
];

