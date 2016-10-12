import editor from './editor';

angular
  .module('dranimate', [
    'ngMaterial',
    'dranimate.editor',
  ])
  .config($mdThemingProvider => {
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('amber')
      .warnPalette('red');
  });
