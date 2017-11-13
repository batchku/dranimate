import dranimate from '../../models_remove_me/dranimate';
import Puppet from '../../models_remove_me/puppet';
import requestPuppetCreation from '../../models_remove_me/PuppetFactory';
import ImageToMesh from '../../lib_remove_me/imagetomesh/imagetomesh';
import editorHelper from './EditorHelper';

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
  let imageToMesh = new ImageToMesh();
  var $ctrl = this;
  $ctrl.threshold = 25;


  setTimeout(() => {
    const canvasElement = document.getElementById('edit-mesh-canvas');
    const puppetImageSrc = editorHelper.getItem();
    imageToMesh.setup(canvasElement);
    if (editorHelper.isPuppet) {
      const puppet = editorHelper.getItem();
      imageToMesh.editImage(
        puppet.image.src,
        puppet.controlPointPositions,
        puppet.backgroundRemovalData
      )
      .then(() => imageToMesh.doSlic($ctrl.threshold));
    }
    else {
      imageToMesh.editImage(editorHelper.getItem())
        .then(() => imageToMesh.doSlic($ctrl.threshold));
    }

  });

  /* zoompanner controls */
  $ctrl.zoomIn = imageToMesh.zoomIn;
  $ctrl.zoomOut = imageToMesh.zoomOut;
  $ctrl.togglePan = function() {
    imageToMesh.setPanEnabled(!imageToMesh.getPanEnabled());
  };
  $ctrl.getPanEnabled = imageToMesh.getPanEnabled;

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

  $ctrl.onThresholdMouseUp = $event => imageToMesh.doSlic($ctrl.threshold);

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
        $mdDialog.hide();
      });
  };

}
