var express = require('express');
var http = require('http');
var mongodb = require('mongodb');
var path = require('path');

var ObjectID = mongodb.ObjectID;

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3003);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

mongodb.MongoClient.connect('mongodb://127.0.0.1:3002/meteor', function (err, db) {
  if (err) {
    return console.dir(err);
  }

  // Single file for now, may want to split to routes/timeline.js etc. next time.
  app.get('/timelines', function (req, res) {
    db.collection('timelines').find().toArray(function (err, items) {
      res.json(items);
    });
  });

  app.get('/timelines/:id', function (req, res) {
    db.collection('timelines').findOne({
      _id: new ObjectID(req.params.id)
    }, function (err, item) {
      res.json(item);
    });
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
