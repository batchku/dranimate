    EditorCtrl.$inject = ['model', '$scope', '$mdDialog'];
    function EditorCtrl(model, $scope, $mdDialog) {
        var $ctrl = this;

        $ctrl.zoomIn = model.zoomIn;
        $ctrl.zoomOut = model.zoomOut;
        $ctrl.togglePan = function () {
            model.setPanEnabled(!model.getPanEnabled());
        };
        $ctrl.getPanEnabled = model.getPanEnabled;

        $ctrl.puppetIsSelected = function () {
            return model.getSelectedPuppet() !== null;
        };



        $scope.showAdvanced = function (ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'src/ui/editor/loginDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }
    }

