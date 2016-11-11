require('./editor');
require('angular-ui-router');

const app = angular
  .module('dranimate', [
    'ngMaterial',
    'dranimate.editor',
    'ui.router',
    'ngCookies'
  ])
  .config(['$mdThemingProvider', '$httpProvider', function($mdThemingProvider, $httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('amber')
      .warnPalette('red');
  }]);

app.factory('model', require('./models_remove_me/model'));
app.factory('imageToMesh', require('./models_remove_me/imageToMesh'));

app.config(['$locationProvider', '$stateProvider', function($locationProvider, $stateProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
  });

  $stateProvider
    .state('editor', {
      url: '/',
      templateUrl: 'editor/editor.html',
      controller: 'EditorCtrl',
      controllerAs: '$ctrl',
    });
}]);

app.run();
