import EditorController from './EditorController';

import NewPuppetFromJsonDirective from './NewPuppetFromJsonDirective';
import FileUploadContainerDirective from './FileUploadContainerDirective';
import StageContainerDirective from './StageContainerDirective';

const app = angular
  .module('dranimate.editor', [
    'ngMaterial',
    'dranimate.editor.puppetDashboard',
    'dranimate.editor.zoompanner',
    'dranimate.model'
  ])
  .component([
    templateUrl: 'editor/editor.html',
    controller: EditorController,
  ]);

app.directive('dranimateNewPuppetFromJson', NewPuppetFromJsonDirective);
app.directive('dranimateFileUploadContainer', FileUploadContainerDirective);
app.directive('dranimateStageContainer', StageContainerDirective);

export default app;
