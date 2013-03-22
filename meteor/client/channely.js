Meteor.subscribe('channels');

Deps.autorun(function () {
  Meteor.subscribe('textposts', Session.get('currentChannelId'));
});

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});

Template.channels.channels = function () {
  return Channels.find({}, {sort: {name: 1}});
};

Handlebars.registerHelper('toHexString', function(_id) {
  return _id.toHexString();
});

Handlebars.registerHelper('formatTime', function(time) {
  var timeWrapper = moment(time);
  return timeWrapper.format('h:mm:ss a');
});

Template.channels_add.events({
  'click .add': function (event, template) {
    var name = template.find('.name').value;
    var description = template.find('.description').value;
    var channelId = Channels.insert({
      name: name,
      description: description
    });
    Meteor.Router.to('/channels/' + channelId.toHexString());
  },

  'click .cancel': function() {
    history.back();
  }
});

Template.channel.posts = function () {
  return TextPosts.find({_channel: Session.get('currentChannelId')});
};

Template.channel.events({
  'submit form': function (event, template) {
    var input = template.find('.post_add');
    TextPosts.insert({
      _channel: Session.get('currentChannelId'),
      content: input.value,
      time: Date.now()
    });
    input.value = '';
    event.preventDefault();
    event.stopPropagation();
  }
});