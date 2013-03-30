var TextPost = require('../models/textpost').TextPost,
    Channel = require('../models/channel').Channel,
    User = require('../models/user').User,
    passport = require('passport');

exports.index = function (req, res) {
  TextPost.find({ _channel: req.params.id }, null, {sort: {time: 1}},
    function(err, textPosts) {
      err ? res.send(500, err) : res.json(textPosts);
    });
}

exports.create = function (req, res) {
  Channel.findById(req.body.channelId, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!");}
    else {
      var userProperties = {
        content: req.body.content,
    _channel: channel._id };

      // if access token exists, save user
      // else just save the username
      if (req.query.access_token) {
        User.findOne({ accessToken: req.query.access_token }, function (err, user) {
          if (err || !user) { userProperties.username = req.body.username; }
          else if (user) {
            userProperties.owner = user._id;
            console.log(userProperties);
          }

        var textPost = new TextPost(userProperties);
        textPost.save(function (err) {
          err ? res.send(422, err) : res.send(201, textPost);
        });

        });
      } else {
        userProperties.username = req.body.username;

        var textPost = new TextPost(userProperties);
        textPost.save(function (err) {
          err ? res.send(422, err) : res.send(201, textPost);
        });

      }
    }
  });
};

exports.delete = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    TextPost.findById(req.params.id, function (err, textPost) {
      if (!textPost) res.send(404);
      else if (textPost.owner != req.user._id) { res.send(403); }
      else {
        textPost.remove(function () {
          res.send(204);
        });
      }
    });
  }
]
