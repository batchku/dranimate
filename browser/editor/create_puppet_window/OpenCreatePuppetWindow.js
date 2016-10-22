var CreatePuppetWindowCtrl = require('./CreatePuppetWindowCtrl');
var Puppet = require('../../models_remove_me/puppet');

module.exports = ['$mdMedia', '$mdDialog', 'imageToMesh', 'model', OpenCreatePuppetWindow];

function makePuppetFromImageToMesh(imageToMesh, model) {
  return function() {
    imageToMesh.generateMesh();

    var vertices = imageToMesh.getVertices();
    var faces = imageToMesh.getTriangles();
    var controlPoints = imageToMesh.getControlPointIndices();
    var controlPointPositions = imageToMesh.getControlPoints();
    var image = imageToMesh.getImage();
    var imageNoBG = imageToMesh.getImageNoBackground();
    var backgroundRemovalData = imageToMesh.getBackgroundRemovalData();

    var p = new Puppet(image);
    p.setImageToMeshData(imageNoBG, controlPointPositions, backgroundRemovalData);
    p.generateMesh(vertices, faces, controlPoints);
    model.addPuppet(p);
  };
};

function OpenCreatePuppetWindow($mdMedia, $mdDialog, imageToMesh, model) {
  return {
    restrict: 'A',
    link: function(scope, $element) {
      $element.bind('click', function(e) {
        $mdDialog.show({
          controller: CreatePuppetWindowCtrl,
          controllerAs: '$ctrl',
          templateUrl: 'editor/create_puppet_window/create_puppet_window.html',
          parent: angular.element(document.body),
          closeTo: element,
          fullscreen: $mdMedia('xs')
        });
      }).then(makePuppetFromImageToMesh(imageToMesh, model));
    }
  };
}
