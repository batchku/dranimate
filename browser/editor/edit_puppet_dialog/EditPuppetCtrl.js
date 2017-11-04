var $ = require('jquery');
// const dranimate = require('../../models_remove_me/dranimate.js');
import dranimate from '../../models_remove_me/dranimate';
import Puppet from '../../models_remove_me/puppet';

/* to translate properties from/to imageToMesh to/from the controller */
function transEditModeToCtrl(v) { return v ? 'editCtrlPt' : 'cropImg'; };
function transEditModeFromCtrl(v) {
  switch (v) {
    case 'editCtrlPt': return true;
    case 'cropImg': return false;
  };
};
function transSelectModeToCtrl(v) { return v ? 'select' : 'remove'; };
function transSelectModeFromCtrl(v) {
  switch (v) {
    case 'select': return true;
    case 'remove': return false;
  };
};

module.exports = ['$scope', 'imageToMesh', '$mdDialog', EditPuppetCtrl];

function EditPuppetCtrl($scope, imageToMesh, $mdDialog) {
  var $ctrl = this;

  /* zoompanner controls */
  $ctrl.zoomIn = imageToMesh.zoomIn;
  $ctrl.zoomOut = imageToMesh.zoomOut;
  $ctrl.togglePan = function() {
    imageToMesh.setPanEnabled(!imageToMesh.getPanEnabled());
  };
  $ctrl.getPanEnabled = imageToMesh.getPanEnabled;

  // dummy model for threshold. TODO: hook it up yo!
  $ctrl.threshold = 25;

  $ctrl.editMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddControlPoints(transEditModeFromCtrl(newVal))
      : transEditModeToCtrl(imageToMesh.getAddControlPoints());
  };

  $ctrl.selectMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddPixels(transSelectModeFromCtrl(newVal))
      : transSelectModeToCtrl(imageToMesh.getAddPixels());
  };

  $ctrl.notCropImgMode = function() {
    return imageToMesh.getAddControlPoints();
  };

  $ctrl.onCancel = $event => $mdDialog.cancel();

  $ctrl.onSave = $event => {
    // save puppet? this was in the directive: OpenEditPuppetDialog
    // console.log('-----', imageToMesh, model);
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
    dranimate.addPuppet(p);




    $mdDialog.hide();
  };

}
