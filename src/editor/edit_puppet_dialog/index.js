const EditPuppetCtrl = require('./EditPuppetCtrl');

var app = angular.module('dranimate.editor.editPuppetDialog', [
  'ngMaterial'
]);

app.controller('EditPuppetCtrl', EditPuppetCtrl);

// app.directive('dranimateCancelEditPuppetDialog', require('./CancelEditPuppetDialog'));
// app.directive('dranimateFinishEditPuppetDialog', require('./FinishEditPuppetDialog'));
