exports.randomStr = function makeSecret(length) {
  var buf = [];
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i<length; i++) {
    buf.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  return buf.join('');
}
