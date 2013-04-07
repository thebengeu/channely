var Channel = require('../models/channel').Channel,
    User = require('../models/user').User,
    passport = require('passport');

// Channel routes

exports.index = function (req, res) {
    Channel
      .find()
      .populate('owner', '_id username')
      .exec(function (err, channels) {
        err ? res.send(500, err) : res.json(channels);
      });
}

exports.show = function (req, res) {
    Channel
      .findById(req.params.id)
      .populate('owner', '_id username')
      .exec(function (err, channel) {
        !channel ? res.send(404) : res.json(channel);
      });
}

// Channel create, params:
// name:
exports.create = [
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    var channel = new Channel({
      name: req.body.name,
      createdAt: req.body.createdAt,
      owner: req.user._id
    });
    channel.save(function (err) {
      err ? res.send(422, err) : res.send(201, channel);
    });
  }
]

exports.update = [
passport.authenticate('bearer', {session: false}),
  function (req, res) {
    Channel.findById(req.params.id, function (err, channel) {
      if (!channel) {
        res.send(404);
      } else if (channel.owner != req.user._id) {
        res.send(403); // authorizaton not granted
      } else {
        channel.name = req.body.name;
        channel.save(function (err) {
          err ? res.send(422, err) : res.send(channel);
        });
      }
    });
  }
]

exports.delete = [
passport.authenticate('bearer', {session: false}),
  function (req, res) {
    Channel.findById(req.params.id, function (err, channel) {
      if (!channel) res.send(404, "No such channel exists");
      else if (err) res.send(500, err);
      else if (channel.owner != req.user._id) {
        res.send(403);
      } else {
        channel.remove(function () {
          res.send(204);
        });
      }
    });
  }
]
