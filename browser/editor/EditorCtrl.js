module.exports = ['$scope', '$mdDialog', 'model', EditorCtrl];

function EditorCtrl($scope, $mdDialog, model) {
  var $scope = this;

  $scope.zoomIn = model.zoomIn;
  $scope.zoomOut = model.zoomOut;
  $scope.togglePan = function () {
    model.setPanEnabled(!model.getPanEnabled());
  };
  $scope.getPanEnabled = model.getPanEnabled;

  $scope.puppetIsSelected = function () {
    return model.getSelectedPuppet() !== null;
  };

  $scope.showAdvanced = function (ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'src/ui/editor/loginDialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function (answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function () {
      $scope.status = 'You cancelled the dialog.';
    });
  };

  function DialogController($scope, $mdDialog) {
    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };
  }
}
