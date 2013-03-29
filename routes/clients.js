var Client = require('../models/client').Client,
    utils = require('../utils.js');

// These routes should only ever be used by an administrative user.
// They are currently unprotected, however.
exports.index = function (req, res) {
  Client.find(function (err, clients) {
    err ? res.send(500, err) : res.json(clients);
  });
}

exports.create = function (req, res) {
  var tmpSecret = utils.randomStr(30);
  var tmpClient = new Client({
    name: req.body.name,
    clientSecret: tmpSecret
  });
  tmpClient.save(function (err) {
    if (err) res.send(422, err);
    else 
      res.send(201, tmpClient);
  });
}

exports.delete = function(req, res) {
  Client.findById(req.params.id, function (err, client) {
    if (!client) res.send(404, "No such client exists");
    else {
      client.remove(function () {
        res.send(204);
      });
    }
  });
}
