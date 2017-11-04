require('./edit_puppet_dialog');

const app = angular.module('dranimate.editor', [
  'ngMaterial',
  'dranimate.editor.editPuppetDialog'
]);

app.controller('EditorCtrl', require('./EditorCtrl'));

app.directive('dranimateNewPuppetFromJson', require('./NewPuppetFromJson'));
app.directive('dranimateStageContainer', require('./StageContainer'));

// app.directive('dranimateOpenEditPuppetDialog', require('./edit_puppet_dialog/OpenEditPuppetDialog'));

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
  controller: require('./PuppetParametersCtrl'),
});
