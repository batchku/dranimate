module.exports = ['model', PuppetParametersCtrl];

function PuppetParametersCtrl(model) {
  var $scope = this;

  $scope.rotation = 0;

  $scope.x = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!value) return (puppet && puppet['x']) || 0;
    puppet['x'] = value;
  };

  $scope.y = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!value) return (puppet && puppet['y']) || 0;
    puppet['y'] = value;
  };

  $scope.scale = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!value) return (puppet && puppet['scale'] * 100) || 100;
    puppet['scale'] = value / 100;
  };

  $scope.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = model.deleteSelectedPuppet;
}
