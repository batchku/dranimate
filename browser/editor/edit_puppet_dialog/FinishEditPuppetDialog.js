edPupDogMod.directive('dranFinishEditPuppetDialog', ['$mdDialog', function($mdDialog) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      element.bind('click', function(ev) {
        $mdDialog.hide();
      });
    }
  };
}]);
