var Channel = require('../models/channel').Channel,
    passport = require('passport');

// Channel routes

exports.index = function (req, res) {
    Channel.find(function (err, channels) {
      err ? res.send(500, err) : res.json(channels);
    });
}

exports.show = function (req, res) {
    Channel.findById(req.params.id, function (err, channel) {
      !channel ? res.send(404) : res.json(channel);
    });
}

// Channel create, params:
// name:
exports.create = [ 
  passport.authenticate('bearer', {session: false}),
  function (req, res) {
    var channel = new Channel(req.body);
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
      else {
        channel.remove(function () {
          res.send(204);
        });
      }
    });
  }
]
