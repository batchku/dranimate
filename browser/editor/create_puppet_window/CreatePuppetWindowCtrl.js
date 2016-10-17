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

module.exports = ['$scope', CreatePuppetWindowCtrl];

function CreatePuppetWindowCtrl($scope) {
  /* zoompanner controls */
  $scope.zoomIn = imageToMesh.zoomIn;
  $scope.zoomOut = imageToMesh.zoomOut;
  $scope.togglePan = function() {
    imageToMesh.setPanEnabled(!imageToMesh.getPanEnabled());
  };
  $scope.getPanEnabled = imageToMesh.getPanEnabled;

  // dummy model for threshold. TODO: hook it up yo!
  $scope.threshold = 25;

  $scope.editMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddControlPoints(transEditModeFromCtrl(newVal))
      : transEditModeToCtrl(imageToMesh.getAddControlPoints());
  };

  $scope.selectMode = function(newVal) {
    return arguments.length
      ? imageToMesh.setAddPixels(transSelectModeFromCtrl(newVal))
      : transSelectModeToCtrl(imageToMesh.getAddPixels());
  };

  $scope.notCropImgMode = function() {
    return imageToMesh.getAddControlPoints();
  };
}
