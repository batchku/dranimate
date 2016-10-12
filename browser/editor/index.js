import EditorController from './EditorController';

import NewPuppetFromJson from './NewPuppetFromJson';
import FileUploadContainer from './FileUploadContainer';
import StageContainer from './StageContainer';

const app = angular
  .module('dranimate.editor', [
    'ngMaterial',
    'dranimate.editor.puppetDashboard',
    'dranimate.editor.zoompanner',
    'dranimate.model'
  ])
  .component([
    templateUrl: require('./editor.html'),
    controller: EditorController,
  ]);

app.directive('dranimateNewPuppetFromJson', NewPuppetFromJson);
app.directive('dranimateFileUploadContainer', FileUploadContainer);
app.directive('dranimateStageContainer', StageContainer);

export default app;
