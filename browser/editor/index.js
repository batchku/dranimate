//require('./edit_puppet_dialog');
//require('./puppet_dashboard');
//require('./zoompanner');

var EditorCtrl = require('./EditorCtrl');

var NewPuppetFromJson = require('./NewPuppetFromJson');
var FileUploadContainer = require('./FileUploadContainer');
var StageContainer = require('./StageContainer');

const app = angular
  .module('dranimate.editor', [
    'ngMaterial',
    'dranimate.editor.puppetDashboard',
    'dranimate.editor.zoompanner',
    'dranimate.model'
  ]);

app.directive('dranimateNewPuppetFromJson', NewPuppetFromJson);
app.directive('dranimateFileUploadContainer', FileUploadContainer);
app.directive('dranimateStageContainer', StageContainer);
