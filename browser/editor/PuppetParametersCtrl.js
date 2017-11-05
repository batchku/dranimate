var EditPuppetCtrl = require('./edit_puppet_dialog/EditPuppetCtrl');

module.exports = ['model', '$mdDialog', PuppetParametersCtrl];

function PuppetParametersCtrl(model, $mdDialog) {
  var $scope = this;

  $scope.rotation = function(value) {
    var puppet = model.getSelectedPuppet();
    return (puppet && puppet.rotation(value)) || 0;
  };

  $scope.x = function(value) {
    var puppet = model.getSelectedPuppet();
    return (puppet && Math.floor(puppet.x(value))) || 0;
  };

  $scope.y = function(value) {
    var puppet = model.getSelectedPuppet();
    return (puppet && Math.floor(puppet.y(value))) || 0;
  };

  $scope.scale = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!puppet) return 100;

    return value ? puppet.scale(value / 100) : puppet.scale() * 100;
  };

  $scope.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = model.deleteSelectedPuppet;

  $scope.openEditPuppetDialog = $event => {
    $mdDialog.show({
      controller: EditPuppetCtrl,
      controllerAs: '$ctrl',
      templateUrl: 'editor/edit_puppet_dialog/edit_puppet_dialog.html'
    });
  };
}
