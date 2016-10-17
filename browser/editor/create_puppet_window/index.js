var app = angular.module('dranimate.editor.createPuppetWindow', [
  'ngMaterial',
]);

app.controller('CreatePuppetWindowCtrl', require('./CreatePuppetWindowCtrl'));

app.directive('dranimateCancelEditPuppetDialog', require('./CancelEditPuppetDialog'));
app.directive('dranimateFinishEditPuppetDialog', require('./FinishEditPuppetDialog'));
app.directive('dranimateImageToMeshContainer', require('./ImageToMeshContainer'));

app.component({
  templateUrl: 'editor/create_puppet_window/create_puppet_window.html',
  controller: 'EditPuppetDialogCtrl',
});
