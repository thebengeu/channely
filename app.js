var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var path = require('path');

// Routing imports
var timelines = require('./routes/timelines');

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

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  app.get('/timelines', timelines.index);
  app.get('/timelines/:id', timelines.show);
  app.post('/timelines', timelines.create);
  app.put('/timelines/:id', timelines.update);
  app.delete('/timelines/:id', timelines.delete);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
