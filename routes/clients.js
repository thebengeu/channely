var Client = require('../models/client').Client,
    utils = require('../utils.js');

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
    else {
      var client = tmpClient.toObject();
      delete client.clientSecret;
      res.send(201, client);
    }
  });
}
