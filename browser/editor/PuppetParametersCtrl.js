import dranimate from '../models_remove_me/dranimate';
import editorHelper from './edit_puppet_dialog/EditorHelper';

const FileSaver = require('file-saver');
var EditPuppetCtrl = require('./edit_puppet_dialog/EditPuppetCtrl');

module.exports = ['$mdDialog', PuppetParametersCtrl];

function PuppetParametersCtrl($mdDialog) {
  var $scope = this;

  $scope.rotation = function(value) {
    var puppet = dranimate.getSelectedPuppet();
    return (puppet && puppet.rotation(value)) || 0;
  };

  $scope.x = function(value) {
    var puppet = dranimate.getSelectedPuppet();
    return (puppet && Math.floor(puppet.x(value))) || 0;
  };

  $scope.y = function(value) {
    var puppet = dranimate.getSelectedPuppet();
    return (puppet && Math.floor(puppet.y(value))) || 0;
  };

  $scope.scale = function(value) {
    var puppet = dranimate.getSelectedPuppet();
    if (!puppet) return 100;

    return value ? puppet.scale(value / 100) : puppet.scale() * 100;
  };

  $scope.noPuppetSelected = function() {
    return dranimate.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = dranimate.deleteSelectedPuppet;

  $scope.openEditPuppetDialog = $event => {
    const puppetImageSrc = dranimate.getSelectedPuppet().image.src;
    editorHelper.setImageSrc(puppetImageSrc);
    $mdDialog.show({
      controller: EditPuppetCtrl,
      controllerAs: '$ctrl',
      templateUrl: 'editor/edit_puppet_dialog/edit_puppet_dialog.html',
    });
  };

  $scope.savePuppet = $event => {
    console.log('savePuppet', dranimate.getSelectedPuppet());
    const puppetJsonString = dranimate.getSelectedPuppet().getJSONData();
    var blob = new Blob([puppetJsonString], {type: 'application/json;charset=utf-8'});
    FileSaver.saveAs(blob, 'testpuppet.json');
  };
}
