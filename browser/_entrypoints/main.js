require('../editor');
require('angular-ui-router');

const app = angular
  .module('dranimate', [
    'ngMaterial',
    'dranimate.editor',
    'ui.router',
  ])
  .config(['$mdThemingProvider', '$httpProvider', function($mdThemingProvider, $httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('amber')
      .warnPalette('red');
  }]);

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
