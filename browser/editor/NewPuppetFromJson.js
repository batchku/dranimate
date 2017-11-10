import requestPuppetCreation from '../models_remove_me/PuppetFactory';
import editorHelper from './edit_puppet_dialog/EditorHelper';

var EditPuppetCtrl = require('./edit_puppet_dialog/EditPuppetCtrl');
var dranimate = require('../models_remove_me/dranimate');

// TODO: Load this stuff from the server instead of the json file
function loadJSONPuppet(element, e) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var puppetData = JSON.parse(e.target.result);
    var image = new Image();
    image.onload = function () {
      var imageNoBG = new Image();
      imageNoBG.onload = function () {
        const backgroundRemovalData = new ImageData(
          Uint8ClampedArray.from(puppetData.backgroundRemovalData.data),
          puppetData.backgroundRemovalData.width,
          puppetData.backgroundRemovalData.height
        );

        const puppetParams = {
          vertices: puppetData.verts,
          faces: puppetData.faces,
          controlPoints: puppetData.controlPoints,
          controlPointPositions: puppetData.controlPointPositions,
          image,
          imageNoBG,
          backgroundRemovalData
        };
        const puppet = requestPuppetCreation(puppetParams);
        console.log('success?', puppet);
      };
      imageNoBG.src = puppetData.imageNoBGData;
    };
    image.src = puppetData.imageData;
  };
  reader.readAsText(element[0].files[0]);
}

module.exports = ['$mdMedia', '$mdDialog', NewPuppetFromJson];

function NewPuppetFromJson($mdMedia, $mdDialog) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $element.bind('change', e => {
        var imageTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];

        var filetype = $element[0].files[0].type;

        /* this section is to deal with a strange bug on some windows machines where
         * uploaded files have their file types listed as an empty string. */
        if (filetype == '') {
          filetype = $element[0].files[0].name.split('.');
          filetype = filetype[filetype.length - 1];
          if (filetype == 'json') {
            filetype = 'application/json';
          }
          if (['jpeg', 'jpg', 'gif', 'png'].indexOf(filetype) !== -1) {
            filetype = 'image/' + filetype;
          }
        }

        if (['application/json'].indexOf(filetype) !== -1) {
          loadJSONPuppet($element, e);
        } else if (imageTypes.indexOf(filetype) !== -1) {

          var reader = new FileReader();
          reader.onload = function(e) {
            editorHelper.setItem(reader.result);
            $mdDialog.show({
              controller: EditPuppetCtrl,
              controllerAs: '$ctrl',
              templateUrl: 'editor/edit_puppet_dialog/edit_puppet_dialog.html',
              fullscreen: $mdMedia('xs')
            });
          };
          reader.readAsDataURL($element[0].files[0]);
        } else {
          console.log('loadFile() called for unsupported filetype: ' + element[0].files[0].type);
        }
      });
    },
  };
}
