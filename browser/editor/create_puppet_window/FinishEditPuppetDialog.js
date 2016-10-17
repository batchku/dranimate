module.exports = ['$mdDialog', FinishEditPuppetDialog];

function FinishEditPuppetDialog($mdDialog) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(ev) {
        $mdDialog.hide();
      });
    }
  };
}
