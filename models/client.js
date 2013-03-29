// Client stores the client ID and client secret for approved client consumers
// e.g. iPad app, web app, etc.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientSecret: { type: String, required: true }
});

var clientModel = mongoose.model('Client', clientSchema);

module.exports = {
  Client: clientModel
};
