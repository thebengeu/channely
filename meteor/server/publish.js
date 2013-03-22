Meteor.publish('channels', function() {
  return Channels.find();
});

Meteor.publish('textposts', function(channelId) {
  return TextPosts.find({_channel: channelId});
});