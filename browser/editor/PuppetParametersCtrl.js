module.exports = ['model', PuppetParametersCtrl];

function PuppetParametersCtrl(model) {
  var $scope = this;

  $scope.x = 0;
  $scope.y = 0;
  $scope.rotation = 0;

  // TODO: merge scaleX and scaleY on the model
  $scope.scale = function(value) {
    var puppet = model.getSelectedPuppet();
    if (!value) return puppet['scaleX'] * 100 || 100;
    puppet['scaleX'] = puppet['scaleY'] = value / 100;
  };

  $scope.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = model.deleteSelectedPuppet;
}
