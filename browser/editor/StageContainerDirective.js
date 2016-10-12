    edMod.directive('dranStageContainer', ['model', function (model) {
        return {
            restrict: 'AE',
            link: function (scope, element) {
                /* element[0] gets the raw DOM reference from the jqlite object */
                model.setup(element[0]);
            }
        };
    }]);

