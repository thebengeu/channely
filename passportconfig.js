// Passport Configuration
var passport = require('passport'),
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    User = require('./models/user').User,
    Client = require('./models/client').Client;


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
        User.find({ username: uname }, function (err, user) {
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
