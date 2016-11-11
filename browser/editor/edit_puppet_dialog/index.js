var app = angular.module('dranimate.editor.editPuppetDialog', [
  'ngMaterial'
]);

app.controller('EditPuppetCtrl', require('./EditPuppetCtrl'));

app.directive('dranimateCancelEditPuppetDialog', require('./CancelEditPuppetDialog'));
app.directive('dranimateFinishEditPuppetDialog', require('./FinishEditPuppetDialog'));
