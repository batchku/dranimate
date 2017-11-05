import dranimate from '../models_remove_me/dranimate';
import imageToMesh from '../lib_remove_me/imagetomesh/imagetomesh';

module.exports = ['$scope', '$mdDialog', '$rootScope', EditorCtrl];

var $ = require('jquery');

function EditorCtrl($scope, $mdDialog, $rootScope) {
  var editorScope = $scope;
  const dranimateStageContainer = document.getElementById('dranimateStageContainer');
  dranimate.setup(dranimateStageContainer);
  dranimate.onChange(() => $rootScope.$evalAsync(() => {}));
  // imageToMesh.onChange(() => $rootScope.$evalAsync(() => {}));

  $scope.zoomIn = dranimate.zoomIn;
  $scope.zoomOut = dranimate.zoomOut;
  $scope.togglePan = function () {
    dranimate.setPanEnabled(!dranimate.getPanEnabled());
  };

  $scope.getPanEnabled = dranimate.getPanEnabled;

  $scope.puppetIsSelected = function () {
    return dranimate.getSelectedPuppet() !== null;
  };

  $scope.uploadFile = function (e) {
    $('#file-picker').click();
  };

}
