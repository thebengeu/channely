var HLSRecording = require('../models/hlsrecording').HLSRecording,
    HLSChunk = require('../models/hlschunk').HLSChunk,
    VideoThumbnailPost = require('../models/videothumbnailpost').VideoThumbnailPost,
    User = require('../models/user').User,
    Channel = require('../models/channel').Channel;

var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var mv = require('mv');
var path = require('path');

var HLS_FILE_PATH = '/ebs/public/hls/';
var HLS_URL = 'http://upthetreehouse.com/hls/';
var HLS_HEADER = '#EXTM3U\n#EXT-X-PLAYLIST-TYPE:EVENT\n#EXT-X-TARGETDURATION:11\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:0';
var HLS_FOOTER = '#EXT-X-ENDLIST';
var DEFAULT_THUMBNAIL_SIZE = '80x60';

var generatePlaylist = function (hlsRecording, callback) {
  HLSChunk
    .find({ _recording: hlsRecording.id })
    .sort('seqNo')
    .lean()
    .exec(function (err, chunks) {
      if (err) return callback && callback(err);

      var entries = [HLS_HEADER];

      for (var i = 0; i < chunks.length; i++) {
        var chunk = chunks[i];
        if (chunk.seqNo != i) break;

        entries.push('#EXTINF:' + chunk.duration.toFixed(3) + ',\n' + path.basename(chunk.filePath));
      }

      if (hlsRecording.endSeqNo === i - 1) entries.push(HLS_FOOTER);

      fs.writeFile(path.join(HLS_FILE_PATH, hlsRecording.id, hlsRecording.id + '.m3u8'),
        entries.join('\n'), function (err) {
          if (callback) callback(err);
        });
    });
};

exports.createRecording = function (req, res) {
  Channel.findById(req.body._channel, function (err, channel) {
    if (err) { res.send(500, err); }
    else if (!channel) { res.send(404, "No such channel exists!"); }
    else {
      var hlsRecording = new HLSRecording({
        _channel: channel._id,
        startDate: req.body.startDate
      });
      var playlistDir = path.join(HLS_FILE_PATH, hlsRecording.id);
      fs.mkdir(playlistDir, function (err) {
        if (err) return res.send(422, err);

        hlsRecording.playlistURL = HLS_URL + hlsRecording.id + '/' + hlsRecording.id + '.m3u8';

        generatePlaylist(hlsRecording, function (err) {
          if (err) return res.send(422, err);

          var token = undefined;

          if (req.headers && req.headers['authorization']) {
            var parts = req.headers['authorization'].split(' ');
            if (parts.length == 2) {
              var scheme = parts[0]
                , credentials = parts[1];

              if (/Bearer/i.test(scheme)) {
                token = credentials;
              }
            }
          }

          if (req.body && req.body['access_token']) {
            token = req.body['access_token'];
          }

          if (req.query && req.query['access_token']) {
            token = req.query['access_token'];
          }

          // if there's an access token, get the user and attach it to this recording
          // otherwise just save a username
          if (token) {
            User.findOne({accessToken: token },
              function(err, user){
                if (err || !user) {
                  hlsRecording.username = req.body.username;
                } else if (user) {
                  hlsRecording.owner = user._id;
                  hlsRecording.username = user.username;
                }

                hlsRecording.save(function (err) {
                  err ? res.send(422, err) : res.send(201, hlsRecording);
                });
              });
          } else {
            if (req.body.username)
              hlsRecording.username = req.body.username;

            hlsRecording.save(function (err) {
              err ? res.send(422, err) : res.send(201, hlsRecording);
            });
          }
        });
      });
    }
  });
};

exports.stopRecording = function (req, res) {
  HLSRecording.findById(req.params.id, function (err, hlsRecording) {
    if (!hlsRecording) return res.send(404, 'No such HLS recording exists!');

    if (!req.body.endDate || !req.body.endSeqNo)
      return res.send(422, 'Both endDate and endSeqNo are required.');

    hlsRecording.endDate = req.body.endDate;
    hlsRecording.endSeqNo = req.body.endSeqNo;

    generatePlaylist(hlsRecording, function (err) {
      if (err) return res.send(422, err);

      hlsRecording.save(function (err) {
        err ? res.send(422, err) : res.send(hlsRecording);
      });
    });
  });
};

var generateThumbnail = function (videoPath, size, callback) {
  var proc = new ffmpeg({ source: videoPath })
    .withSize(size)
    .takeScreenshots({
      count: 1,
      filename: '%b_%r'
    }, '/', function (err, filenames) {
      callback(err, filenames[0]);
    });
}

var processChunk = function (req, hlsRecording, newPath, baseName, callback) {
  var url = HLS_URL + hlsRecording.id + '/' + baseName;

  var hlsChunk = new HLSChunk({
    duration: req.body.duration,
    filePath: newPath,
    seqNo: req.body.seqNo,
    url: url,
    _recording: hlsRecording.id
  });

  // Generate thumbnail for every minute of video
  if (hlsChunk.seqNo % 6 === 0) {
    generateThumbnail(newPath, DEFAULT_THUMBNAIL_SIZE, function (err, filename) {
      if (err) return callback(err);

      var thumbnailTime = hlsRecording.startDate;
      thumbnailTime.setSeconds(thumbnailTime.getSeconds() + 10 * hlsChunk.seqNo);

      var videoThumbnailPost = new VideoThumbnailPost({
        _channel: hlsRecording._channel,
        _video: hlsRecording._id,
        startDate: thumbnailTime,
        url: HLS_URL + hlsRecording.id + '/' + path.basename(filename)
      });

      hlsChunk.save(function (err) {
        if (err) return callback(err);

        generatePlaylist(hlsRecording, function (err) {
          if (err) return callback(err);

          videoThumbnailPost.save(function (err) {
            callback(err, hlsChunk);
          });
        });
      });
    });
  } else {
    hlsChunk.save(function (err) {
      if (err) return callback(err);

      generatePlaylist(hlsRecording, function (err) {
        callback(err, hlsChunk);
      });
    });
  }
}

exports.createChunk = function (req, res) {
  HLSRecording.findById(req.params.id, function (err, hlsRecording) {
    if (err) return res.send(500, err);

    if (!hlsRecording) return res.send(404, 'No such HLS recording exists!');

    var oldPath = req.files.chunk.path;
    var baseName = path.basename(oldPath);
    var extension = path.extname(baseName);
    var newPath;

    if (extension === '.ts') {
      newPath = path.join(HLS_FILE_PATH, hlsRecording.id, baseName);

      mv(oldPath, newPath, function (err) {
        if (err) return res.send(422, err);

        processChunk(req, hlsRecording, newPath, baseName, function (err, hlsChunk) {
          err ? res.send(422, err) : res.send(201, hlsChunk);
        });
      });
    } else if (extension === '.mp4') {
      baseName = path.basename(oldPath, extension) + '.ts';
      newPath = path.join(HLS_FILE_PATH, hlsRecording.id, baseName);

      var proc = new ffmpeg({ source: oldPath })
        .withVideoCodec('copy')
        .withAudioCodec('copy')
        .addOption('-vbsf', 'h264_mp4toannexb')
        .addOption('-loglevel', 'error')
        .saveToFile(newPath, function (stdout, stderr) {
          if (stderr) return res.send(422, stderr);

          processChunk(req, hlsRecording, newPath, baseName, function (err, hlsChunk) {
            err ? res.send(422, err) : res.send(201, hlsChunk);
          });
        });
    } else {
      res.send(500, 'Unexpected video extension');
    }
  });
};