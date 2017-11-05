const editPuppetDialog = require('./edit_puppet_dialog');
const EditorCtrl = require('./EditorCtrl');
const PuppetParametersCtrl = require('./PuppetParametersCtrl');
const newPuppetFromJsonDirective = require('./NewPuppetFromJson');

const app = angular.module('dranimate.editor', [
  'ngMaterial',
  'dranimate.editor.editPuppetDialog'
]);

app.controller('EditorCtrl', EditorCtrl);

app.directive('dranimateNewPuppetFromJson', newPuppetFromJsonDirective);

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
  controller: PuppetParametersCtrl,
});
