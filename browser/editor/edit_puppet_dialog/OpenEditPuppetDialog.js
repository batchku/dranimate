// var EditPuppetCtrl = require('./EditPuppetCtrl');
// var Puppet = require('../../models_remove_me/puppet');
//
// module.exports = ['$mdMedia', '$mdDialog', 'model', OpenEditPuppetDialog];
//
// function makePuppetFromImageToMesh(imageToMesh, model) {
//   return function() {
//     console.log('-----', imageToMesh, model);
//     imageToMesh.generateMesh();
//
//     var vertices = imageToMesh.getVertices();
//     var faces = imageToMesh.getTriangles();
//     var controlPoints = imageToMesh.getControlPointIndices();
//     var controlPointPositions = imageToMesh.getControlPoints();
//     var image = imageToMesh.getImage();
//     var imageNoBG = imageToMesh.getImageNoBackground();
//     var backgroundRemovalData = imageToMesh.getBackgroundRemovalData();
//
//     var p = new Puppet(image);
//     p.setImageToMeshData(imageNoBG, controlPointPositions, backgroundRemovalData);
//     p.generateMesh(vertices, faces, controlPoints);
//     model.addPuppet(p);
//   };
// };
//
// function OpenEditPuppetDialog($mdMedia, $mdDialog, model) {
//   console.log('- - - - OpenEditPuppetDialog', model);
//   return {
//     restrict: 'A',
//     link: function(scope, $element) {
//       $element.bind('click', function(e) {
//         $mdDialog.show({
//           controller: EditPuppetCtrl,
//           controllerAs: '$ctrl',
//           templateUrl: 'editor/edit_puppet_dialog/edit_puppet_dialog.html',
//           parent: angular.element(document.body),
//           closeTo: $element,
//           fullscreen: $mdMedia('xs')
//         }).then(makePuppetFromImageToMesh(imageToMesh, model));
//       });//.then(makePuppetFromImageToMesh(imageToMesh, model));
//     }
//   };
// }
