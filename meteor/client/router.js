Meteor.Router.add({
  '/': 'channels',
  '/channels': 'channels',
  '/channels/add': 'channels_add',
  '/channels/:id': function(id) {
    Session.set('currentChannelId', id);
    return 'channel';
  }
})