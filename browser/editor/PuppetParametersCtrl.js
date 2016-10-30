module.exports = ['model', PuppetParametersCtrl];

function PuppetParametersCtrl(model) {
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
}
