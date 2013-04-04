var HLSRecording = require('../models/hlsrecording').HLSRecording,
    HLSChunk = require('../models/hlschunk').HLSChunk;

var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
var mv = require('mv');
var path = require('path');

var HLS_FILE_PATH = '/ebs/public/hls/';
var HLS_URL = 'http://upthetreehouse.com/hls/';
var HLS_PLAYLIST_NAME = 'playlist.m3u8';
var HLS_HEADER = '#EXTM3U\n#EXT-X-PLAYLIST-TYPE:EVENT\n#EXT-X-TARGETDURATION:10\n#EXT-X-VERSION:3\n#EXT-X-MEDIA-SEQUENCE:0';
var HLS_FOOTER = '#EXT-X-ENDLIST';

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

        entries.push('#EXTINF:' + chunk.duration + ',\n' + path.basename(chunk.filePath));
      }

      if (hlsRecording.endSeqNo === i - 1) entries.push(HLS_FOOTER);

      fs.writeFile(path.join(HLS_FILE_PATH, hlsRecording.id, HLS_PLAYLIST_NAME),
        entries.join('\n'), function (err) {
          if (callback) callback(err);
        });
    });
};

exports.createRecording = function (req, res) {
  var hlsRecording = new HLSRecording({
    startDate: req.body.startDate
  });
  var playlistDir = path.join(HLS_FILE_PATH, hlsRecording.id);
  fs.mkdir(playlistDir, function (err) {
    if (err) return res.send(422, err);

    hlsRecording.playlistURL = HLS_URL + hlsRecording.id + '/' + HLS_PLAYLIST_NAME;
    hlsRecording.save(function (err) {
      err ? res.send(422, err) : res.send(201, hlsRecording);

      // fire off generation of playlist, don't care about result.
      generatePlaylist(hlsRecording);
    });
  });
};

exports.stopRecording = function (req, res) {
  HLSRecording.findById(req.params.id, function (err, hlsRecording) {
    if (!hlsRecording) return res.send(404, 'No such HLS recording exists!');

    if (!req.body.endDate || !req.body.endSeqNo)
      return res.send(422, 'Both endDate and endSeqNo are required.');

    hlsRecording.endDate = req.body.endDate;
    hlsRecording.endSeqNo = req.body.endSeqNo;
    hlsRecording.save(function (err) {
      err ? res.send(422, err) : res.send(hlsRecording);
    });

    // fire off generation of playlist, don't care about result.
    // just in case all chunks have come in before stopRecording is called.
    generatePlaylist(hlsRecording);
  });
};

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

        var url = HLS_URL + hlsRecording.id + '/' + baseName;

        var hlsChunk = new HLSChunk({
          duration: req.body.duration,
          filePath: newPath,
          seqNo: req.body.seqNo,
          url: url,
          _recording: hlsRecording.id
        });

        hlsChunk.save(function (err) {
          err ? res.send(422, err) : res.send(201, hlsChunk);

          // fire off generation of playlist, don't care about result.
          generatePlaylist(hlsRecording);
        });
      });
    } else if (extension === '.mp4') {
      var newBaseName = path.basename(oldPath, extension) + '.ts';
      newPath = path.join(HLS_FILE_PATH, hlsRecording.id, newBaseName);

      var proc = new ffmpeg({ source: oldPath })
        .withVideoCodec('copy')
        .withAudioCodec('copy')
        .addOption('-vbsf', 'h264_mp4toannexb')
        .addOption('-loglevel', 'error')
        .saveToFile(newPath, function (stdout, stderr) {
          if (stderr) return res.send(422, stderr);

          var url = HLS_URL + hlsRecording.id + '/' + newBaseName;

          var hlsChunk = new HLSChunk({
            duration: req.body.duration,
            filePath: newPath,
            seqNo: req.body.seqNo,
            url: url,
            _recording: hlsRecording.id
          });

          hlsChunk.save(function (err) {
            err ? res.send(422, err) : res.send(201, hlsChunk);

            // fire off generation of playlist, don't care about result.
            generatePlaylist(hlsRecording);
          });
        });
    } else {
      res.send(500, 'Unexpected video extension');
    }
  });
};