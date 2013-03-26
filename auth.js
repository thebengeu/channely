var passport = require('passport'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    User = require('../models/user').User;

passport.use(new ClientPasswordStrategy(
      function(clientId, clientSecret, done) {
        User.find({ clientId: clientId }, function (err, client) {
          if (err) { return done(err); }
          if (!client) { return done(null, false); }
          if (client.clientSecret != clientSecret) { return done (null, false); }
          return done(null, client);
        });
      }
      ));
