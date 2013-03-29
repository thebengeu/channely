// Module dependencies

var oauth2orize = require('oauth2orize'), 
    passport = require('passport')
    User = require('../models/user').User;

var server = oauth2orize.createServer();


server.serializeClient(function(client, done) {
  return done(null, client.id);
});


server.deserializeClient(function(id, done) {
  db.clients.find(id, function(err, client) {
    if (err) { return done(err); }
    return done(null, client);
  });
});


server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var code = utils.randomStr(16);
  // change this
  db.authorizationCodes.save(code, client.id, redirectURI, user.id, function(err) {
    if (err) { return done(err); }
    done(null, code);
  });
}));

// Register exchange middleware
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  db.authorizationCodes.find(code, function(err, authCode) {
    if (err) { return done(err); }
    if (client.id !== authCode.clientID) { return done(null, false); }
    if (redirectURI !== authCode.redirectURI) { return done(null, false); }

    var token = utils.randomStr(256)
    db.accessTokens.save(token, authCode.userID, authCode.clientID, function(err) {
      if (err) { return done(err); }
      done(null, token);
    });
  });
}));


exports.authorization = [
login.ensureLoggedIn(),
  server.authorization(function(clientID, redirectURI, done) {
    User.findById(clientID, function(err, client) {
      if (err) { return done(err); }
      // WARNING: For security purposes, it is highly advisable to check that
      // redirectURI provided by the client matches one registered with
      // the server.  For simplicity, this example does not.  You have
      // been warned.
      return done(null, client, redirectURI);
    });
  }),
  function(req, res){
    res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
  }
]

exports.decision = [
login.ensureLoggedIn(),
  server.decision()
  ]

exports.token = [
  passport.authenticate(['oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
  ]

