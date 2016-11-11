module.exports = ['$scope', '$mdDialog', '$cookies', 'model', EditorCtrl];

var $ = require('jquery');

function EditorCtrl($scope, $mdDialog, $cookies, model) {
  var editorScope = $scope;

  $scope.zoomIn = model.zoomIn;
  $scope.zoomOut = model.zoomOut;
  $scope.togglePan = function () {
    model.setPanEnabled(!model.getPanEnabled());
  };

  $scope.getPanEnabled = model.getPanEnabled;

  $scope.puppetIsSelected = function () {
    return model.getSelectedPuppet() !== null;
  };

  $scope.uploadFile = function (e) {
    $('#file-picker').click();
  };

  if ($cookies.get('usernameDisplayed')) {
    $scope.usernameDisplayed = 'Logout ' + $cookies.get('usernameDisplayed');
  } else {
    $scope.usernameDisplayed = 'Login';
  }

  $scope.showLogin = function (ev) {

    if (!$cookies.get('usernameDisplayed')) {
      $mdDialog.show({
        controller: LoginDialogCtrl,
        templateUrl: 'editor/loginDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      });
    } else {
      $cookies.remove('usernameDisplayed');
      $cookies.remove('token');
      $scope.usernameDisplayed = 'Login';
    }
  };

  function LoginDialogCtrl($scope, $http, $cookies, $mdDialog) {
    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.login = function () {
      var req = {
        method: 'POST',
        url: 'rest-auth/login/',
        data: {
          username: $scope.user.name,
          password: $scope.user.passwd
        }
      };
      $http(req).then(function (response) {
        $cookies.put('token', response.data.key);
        $cookies.put('usernameDisplayed', $scope.user.name);
        $http.defaults.headers.common['Authorization'] = 'Token ' + response.data.key;
        editorScope.usernameDisplayed = 'Logout ' + $scope.user.name;
        $mdDialog.hide();
      }, function (error) {
        alert('Auth failed!')
      });

    };
  }
}
