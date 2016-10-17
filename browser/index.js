require('./editor');
require('angular-ui-router');

const app = angular
  .module('dranimate', [
    'ngMaterial',
    'dranimate.editor',
    'ui.router'
  ])
  .config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('amber')
      .warnPalette('red');
  }]);

app.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('editor', {
      url: '/',
      templateUrl: '/editor/editor.html',
      controller: 'EditorCtrl',
      controllerAs: 'Editor',
    });
}]);
