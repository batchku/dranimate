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

  // TODO: merge scaleX and scaleY on the model
  $scope.scale = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!value) return (puppet && puppet['scaleX'] * 100) || 100;
    puppet['scaleX'] = puppet['scaleY'] = value / 100;
  };

  $scope.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = model.deleteSelectedPuppet;
}
