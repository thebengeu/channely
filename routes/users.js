var User = require('../models/user').User,
    utils = require('../utils.js');

exports.show = function (req, res) {
  User.findById(req.params.id).
    select({password: 0})
    .exec(function (err, user) {
    !user ? res.send(404, "No such user exists!") : res.json(user);
  });
}

exports.create = function (req, res) {
  var tmpSecret = utils.randomStr(30);
  var tmpUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  tmpUser.save(function (err) {
    if (err) res.send(422, err) 
    else {
      var usr = tmpUser.toObject();
      delete usr.password;
      res.send(201, usr);
    }  
  });
}

// be careful - username updates and password
// will need to do auth plus checking before user changes his own password
exports.update = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (!err && !user) res.send(404, "No such user exists!");
    else if (err) res.send(500, err);
    else {
      if (req.body.username) user.username = req.body.username;
      if (req.body.password) user.password = req.body.password;
      user.save(function (err) {
        var usr = user.toObject();
        delete usr.password;
        err ? res.send(422, err) : res.send(201, usr);
      });
    }
  })
};


