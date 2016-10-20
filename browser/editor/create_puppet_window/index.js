var app = angular.module('dranimate.editor.createPuppetWindow', [
  'ngMaterial'
]);

app.controller('CreatePuppetWindowCtrl', require('./CreatePuppetWindowCtrl'));

app.directive('dranimateCancelEditPuppetDialog', require('./CancelEditPuppetDialog'));
app.directive('dranimateFinishEditPuppetDialog', require('./FinishEditPuppetDialog'));
app.directive('dranimateImageToMeshContainer', require('./ImageToMeshContainer'));
app.directive('dranimateOpenCreatePuppetWindow', require('./OpenCreatePuppetWindow'));
