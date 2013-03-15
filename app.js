var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var path = require('path');

// Routing imports
var timelines = require('./routes/timelines'),
    events = require('./routes/events'),
    posts = require('./routes/posts');

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

  // Timeline routes
  app.get('/timelines', timelines.index);
  app.get('/timelines/:id', timelines.show);
  app.post('/timelines', timelines.create);
  app.put('/timelines/:id', timelines.update);
  app.delete('/timelines/:id', timelines.delete);

  // Event routes
  app.get('/timelines/:id/events', events.index);
  app.post('/events', events.create); 
  app.delete('/events/:id', events.delete);

  // Text Post routes
  app.get('/timelines/:id/posts', posts.index);
  app.post('/posts', posts.create); // temporary endpoint, please change url to reflect text, image
  app.delete('/posts/:id', posts.delete);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
