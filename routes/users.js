var User = require('../models/user').User;

exports.create = function (req, res) {
  var tmpSecret = makeSecret(13);
  var tmpUser = new User({
    username: req.body.username,
    password: req.body.password,
    clientSecret: tmpSecret
  });
  tmpUser.save(function (err) {
    err ? res.send(422, err) : res.send(201);
  });
}

// be careful - username updates and password
exports.update = function (req, res) {
  User.findById(req.body.clientId, function (err, user) {
    if (!err && !user) res.send(404, "No such user exists!");
    else if (err) res.send(500, err);
    else {
      user.username = req.body.username;
      user.password = req.body.password;
      user.save(function (err) {
        err ? res.send(422, err) : res.send(201);
      });
    }
  })
};

function makeSecret(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
