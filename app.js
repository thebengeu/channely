var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var path = require('path');

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

mongoose.connect('mongodb://127.0.0.1:3002/meteor');

var timelineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

var Timeline = mongoose.model('Timeline', timelineSchema)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // Single file for now, may want to split to routes/timeline.js etc. next time.
  app.get('/timelines', function (req, res) {
    Timeline.find(function (err, timelines) {
      err ? res.send(500, err) : res.json(timelines);
    });
  });

  app.get('/timelines/:id', function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      !timeline ? res.send(404) : res.json(timeline);
    });
  });

  app.post('/timelines', function (req, res) {
    var timeline = new Timeline(req.body);
    timeline.save(function (err) {
      err ? res.send(422, err) : res.send(timeline);
    });
  });

  app.put('/timelines/:id', function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      if (!timeline) {
        res.send(404);
      } else {
        timeline.name = req.body.name;
        timeline.save(function (err) {
          err ? res.send(422, err) : res.send(timeline);
        });
      }
    });
  });

  app.delete('/timelines/:id', function (req, res) {
    Timeline.findById(req.params.id, function (err, timeline) {
      if (!timeline) {
        res.send(404);
      } else {
        timeline.remove(function () {
          res.send(204);
        });
      }
    });
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
