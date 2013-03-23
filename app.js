var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    path = require('path'),
    passport = require('passport');

// Routing imports
var channels = require('./routes/channels'),
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

mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:3002/meteor');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  // Channel routes
  app.get('/channels', channels.index);
  app.get('/channels/:id', channels.show);
  app.post('/channels', channels.create);
  app.put('/channels/:id', channels.update);
  app.delete('/channels/:id', channels.delete);

  // Event routes
  app.get('/channels/:id/events', events.index);
  app.post('/events', events.create); 
  app.delete('/events/:id', events.delete);

  // Text Post routes
  app.get('/channels/:id/posts', posts.index);
  app.post('/posts', posts.create); // temporary endpoint, please change url to reflect text, image
  app.delete('/posts/:id', posts.delete);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
