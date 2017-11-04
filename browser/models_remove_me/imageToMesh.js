const itom = require('../lib_remove_me/imagetomesh/imagetomesh.js');
const ImageToMesh = itom.ImageToMesh;

// XXX WTS is this? Get it out
module.exports = ['$rootScope', ImageToMeshWrapper];

window.imageToMesh = new ImageToMesh();

function ImageToMeshWrapper($rootScope) {
  var imageToMesh = window.imageToMesh; // for debug. comment out for prod!
  //var imageToMesh = new imageToMesh(); // uncomment for production!
  imageToMesh.onChange(function() {
    /* $evalAsync forces a digest (i.e. angular update) cycle
     * when called while one isn't already happening.
     * Allows view to update from the model.
     */
    $rootScope.$evalAsync(function() { });
  });
  return imageToMesh;
}
