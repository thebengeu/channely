Channels = new Meteor.Collection('channels', {idGeneration: 'MONGO'});
TextPosts = new Meteor.Collection('textposts', {idGeneration: 'MONGO'});

Channels.allow({
  insert: function (userId, channel) {
    return true;
  }
});

TextPosts.allow({
  insert: function (userId, textPost) {
    return true;
  }
});