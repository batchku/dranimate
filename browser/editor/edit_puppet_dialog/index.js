import EditPuppetDialogCtrl from 'EditPuppetDialogCtrl';

import CancelEditPuppetDialog from './CancelEditPuppetDialog';
import FinishEditPuppetDialog from './FinishEditPuppetDialog';
import ImageToMeshContainer from './ImageToMeshContainer';

const app = angular
  .module('dranimate.editor', [
    'ngMaterial',
    'dranimate.image-to-mesh',
    'dranimate.model'
  ])
  .component([
    templateUrl: require('./edit_puppet_dialog.html'),
    controller: EditPuppetDialogCtrl,
  ]);

app.directive('dranimateCancelEditPuppetDialog', CancelEditPuppetDialog);
app.directive('dranimateFinishEditPuppetDialog', FinishEditPuppetDialog);
app.directive('dranimateImageToMeshContainer', ImageToMeshContainer);

export default app;
