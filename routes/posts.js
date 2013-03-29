var ImagePost = require('../models/imagepost').ImagePost;
var TextPost = require('../models/textpost').TextPost;
var Channel = require('../models/channel').Channel;

exports.index = function (req, res) {
  TextPost
    .find({ _channel: req.params.id })
    .lean()
    .exec(function(err, textPosts) {
        var posts = [];
        if (err) {
          res.send(500, err);
        }
        textPosts.forEach(function (textPost) {
          textPost.type = 'text';
          posts.push(textPost);
        });

        ImagePost
          .find({ _channel: req.params.id })
          .lean()
          .exec(function(err, imagePosts) {
            if (err) {
              res.send(500, err);
            }
            imagePosts.forEach(function (imagePost) {
              imagePost.type = 'image';
              posts.push(imagePost);
            });

            posts.sort(function compare (a, b) {
              var dateA = a.time;
              var dateB = b.time;
              return dateA < dateB ? -1 : (dateA > dateB ? 1 : 0);
            });

            res.json(posts);
          });
      });
}

