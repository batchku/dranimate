// var $ = require('jquery');
// const dranimate = require('../../models_remove_me/dranimate.js');
import dranimate from '../../models_remove_me/dranimate';
import Puppet from '../../models_remove_me/puppet';
import requestPuppetCreation from '../../models_remove_me/PuppetFactory';
import imageToMesh from '../../lib_remove_me/imagetomesh/imagetomesh';

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

module.exports = ['$scope', '$mdDialog', EditPuppetCtrl];

function EditPuppetCtrl($scope, $mdDialog) {
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

    // dranimate.stopRenderLoop();

    imageToMesh.generateMesh()
      .then(() => {
        const puppetParams = {
          vertices: imageToMesh.getVertices(),
          faces: imageToMesh.getTriangles(),
          controlPoints: imageToMesh.getControlPointIndices(),
          controlPointPositions: imageToMesh.getControlPoints(),
          image: imageToMesh.getImage(),
          imageNoBG: imageToMesh.getImageNoBackground(),
          backgroundRemovalData: imageToMesh.getBackgroundRemovalData()
        };

        const puppet = requestPuppetCreation(puppetParams);
        console.log('success?', puppet);


        // const vertices = imageToMesh.getVertices();
        // const faces = imageToMesh.getTriangles();
        // const controlPoints = imageToMesh.getControlPointIndices();
        // const controlPointPositions = imageToMesh.getControlPoints();
        // const image = imageToMesh.getImage();
        // const imageNoBG = imageToMesh.getImageNoBackground();
        // const backgroundRemovalData = imageToMesh.getBackgroundRemovalData();
        //
        // const p = new Puppet(image);
        // p.setImageToMeshData(imageNoBG, controlPointPositions, backgroundRemovalData);
        // p.generateMesh(vertices, faces, controlPoints);
        // dranimate.addPuppet(p);

        // dranimate.startRenderLoop();

        $mdDialog.hide();

      });


  };

}
