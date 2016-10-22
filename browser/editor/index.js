require('./create_puppet_window');

const app = angular.module('dranimate.editor', [
  'ngMaterial',
  'dranimate.editor.createPuppetWindow'
]);

app.controller('EditorCtrl', require('./EditorCtrl'));

app.controller('PuppetParametersCtrl', require('./PuppetParametersCtrl'));

app.directive('dranimateNewPuppetFromJson', require('./NewPuppetFromJson'));
app.directive('dranimateFileUploadContainer', require('./FileUploadContainer'));
app.directive('dranimateStageContainer', require('./StageContainer'));

app.component('dranimateZoompanner', {
  templateUrl: 'editor/zoompanner.html',
  bindings: {
    zoomIn: '<onZoomIn',
    zoomOut: '<onZoomOut',
    togglePan: '<onPanToggle',
    getPanEnabled: '<panEnabledGetter'
  }
});

app.component('dranimatePuppetParameters', {
  templateUrl: 'editor/puppet_parameters.html',
  controller: 'PuppetParametersCtrl',
});
