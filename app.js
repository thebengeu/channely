var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    path = require('path'),
    passport = require('passport');

// Routing imports
var channels = require('./routes/channels'),
    events = require('./routes/events'),
    posts = require('./routes/posts')
    imageposts = require('./routes/imageposts'),
    textposts = require('./routes/textposts'),
    users = require('./routes/users'),
    clients = require('./routes/clients');

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

mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/meteor');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

  // User routes
  app.get('/users/:id', users.show);
  app.post('/users', users.create);
  app.put('/users/:id', users.update);

  // Client routes - WARNING: not protected;
  // Only supposed to be used by admins (us)
  app.get('/clients', clients.index);
  app.post('/clients', clients.create);
  app.delete('/clients/:id', clients.delete);

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
  app.get('/events/search', events.search);

  // Unified Post routes
  app.get('/channels/:id/posts', posts.index);

  // Text Post routes
  app.get('/channels/:id/posts/text', textposts.index);
  app.post('/posts/text', textposts.create);
  app.delete('/posts/text/:id', textposts.delete);

  // Image Post routes
  app.get('/channels/:id/posts/image', imageposts.index);
  app.post('/posts/image', imageposts.create);
  app.delete('/posts/image/:id', imageposts.delete);
});

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
