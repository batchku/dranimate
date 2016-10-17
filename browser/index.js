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

app.factory('model', require('./models_remove_me/model'));
app.factory('imageToMesh', require('./models_remove_me/imageToMesh'));

app.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('editor', {
      url: '/',
      templateUrl: '/editor/editor.html',
      controller: 'EditorCtrl',
      controllerAs: 'Editor',
    });
}]);
