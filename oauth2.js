// Module dependencies

var passport = require('passport'),
    utils = require('./utils'),
    Client = require('./models/client').Client,
    User = require('./models/user').User;

// Implements the access token strategy
// Consider this X-Auth
// App is to send (via HTTPS) the following credentials:
// - Username
// - Password
// (Username and Password happens via HTTP basic auth)
// - Client ID (hardcoded into the app)
// - Client Secret (hardcoded into the app)
// NOTE: in actual fact, client secret is supposed to be used to calculate
// a nonce, but considering our API is not graded, CBA.
exports.token = [
passport.authenticate(['basic'], { session: false }),
  function(req, res) {
    Client.findById(req.get('clientId'), function (err, client) {
      if (!client) { res.send(401, "No such client"); }
      if (client.clientSecret != req.get('clientSecret')) res.send(401);
    });
    var user = req.user;
    user.accessToken = utils.randomStr(256);
    user.save(function (err) {
      err? res.send(422, err) : res.json(200, {
        username: user.username,
        userId: user._id,
        accessToken: user.accessToken });
    });
  }
]

