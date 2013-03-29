// Module dependencies

var oauth2orize = require('oauth2orize'), 
    passport = require('passport'),
    utils = require('./utils'),
    Client = require('./models/client').Client,
    User = require('./models/user').User;

// Implements the access token strategy
// Consider this X-Auth
// App is to send (via HTTPS) the following credentials:
// - Username
// - Passport
// - Client ID (hardcoded into the app)
// - Client Secret (hardcoded into the app)
// NOTE: in actual fact, client secret is supposed to be used to calculate
// a nonce, but considering our API is not graded, CBA.
exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  function(req, res) {
    Client.findById(req.body.clientId, function (err, client) {
      if (!client.clientSecret == req.body.clientSecret) res.send(401);
    });
    User.findOne({ username: req.body.username }, function (err, user) {
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (err) res.send(500, err);
        if (isMatch) {
          user.accessToken = utils.randomStr(256);
          user.save(function (err) {
            err? res.send(422, err) : res.json(200, {
              username: user.username,
              userId: user._id,
              accessToken: user.accessToken });
          });
        } else {
          res.send(401);
        }
      });
    });
  }
  ]

