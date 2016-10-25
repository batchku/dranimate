var app = angular.module('dranimate.editor.createPuppetWindow', [
  'ngMaterial'
]);

app.controller('EditPuppetCtrl', require('./EditPuppetCtrl'));

app.directive('dranimateCancelEditPuppetDialog', require('./CancelEditPuppetDialog'));
app.directive('dranimateFinishEditPuppetDialog', require('./FinishEditPuppetDialog'));
app.directive('dranimateImageToMeshContainer', require('./ImageToMeshContainer'));
app.directive('dranimateOpenEditPuppetDialog', require('./OpenEditPuppetDialog'));
