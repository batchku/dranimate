// WTF is this..get it out of here
var Dranimate = require('./dranimate');

window.dranimate = new Dranimate(); // for debug. comment out for production!

module.exports = ['$rootScope', Model];

function Model($rootScope) {
  var dranimate = window.dranimate; // for debug. comment out for production!
  // var dranimate = new Dranimate(); // uncomment for production!
  dranimate.onChange(function() {
    /* $evalAsync forces a digest (i.e. angular update) cycle
     * when called while one isn't already happening.
     * Allows view to update from the model.
     */
    $rootScope.$evalAsync(function() { });
  });
  return dranimate;
}
