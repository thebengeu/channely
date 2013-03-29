// Passport Configuration
var passport = require('passport'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    User = require('./models/user').User,
    Client = require('./models/client').Client;


passport.use(new BearerStrategy(
      function(accessToken, done) {
        User.findOne({ accessToken : accessToken }, function (err, user) {
          if (err) return done(err);
          if (!user) return done(null, false);
          // currently only universal scope is implemented
          var info = { scope: '*' }
          done(null, user, info);
        });
      }));

// The ClientPassword strategy is used here for the bearer token strategy
passport.use(new ClientPasswordStrategy(
      function(clientId, clientSecret, done) {
        Client.findById(clientId, function (err, client) {
          if (err) { return done(err); }
          if (!client) { return done(null, false); }
          if (client.clientSecret != clientSecret) { return done (null, false); }
          return done(null, client);
        });
      }
      ));

// The basic strategy is used for authenticating a user using 
// http-basic
passport.use(new BasicStrategy(
      function(uname, password, done) {
        User.findOne({ username: uname }, function (err, user) {
          if (err)  return done(err); 
          if (!user)  return done(null, false); 
          else {
            user.comparePassword(password, function(err, isMatch) {
              if (err) return done(err);
              else {
                if (isMatch) return done(null, user);
                else return done(null, false);
              }
            });
          }
        });
      }));
