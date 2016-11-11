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
      // No cookie found means not login yet, so login now
      $mdDialog.show({
        controller: LoginSignupCtrl,
        templateUrl: 'editor/loginDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
      })
    } else {
      // Already has a cookie, clear the cookie to logout first
      $cookies.remove('usernameDisplayed');
      $cookies.remove('token');
      $scope.usernameDisplayed = 'Login';
    }
  };

  $scope.showSignup = function (ev) {
    // Log out current account before create new account
    $cookies.remove('usernameDisplayed');
    $cookies.remove('token');
    $scope.usernameDisplayed = 'Login';

    $mdDialog.show({
      controller: LoginSignupCtrl,
      templateUrl: 'editor/signupDialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    });

  };

  function LoginSignupCtrl($scope, $http, $cookies, $mdDialog) {
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
        alert('Login Auth failed!')
      });
    };

    $scope.register = function () {
      var req = {
        method: 'POST',
        url: 'rest-auth/registration/',
        data: {
          username: $scope.user.name,
          password1: $scope.user.passwd1,
          password2: $scope.user.passwd2,
          email: $scope.user.email
        }
      };
      $http(req).then(function (response) {
        $cookies.put('token', response.data.key);
        $cookies.put('usernameDisplayed', $scope.user.name);
        $http.defaults.headers.common['Authorization'] = 'Token ' + response.data.key;
        editorScope.usernameDisplayed = 'Logout ' + $scope.user.name;
        $mdDialog.hide();
      }, function (error) {
        alert('Signup Auth failed!')
      });
    };
  }
}
