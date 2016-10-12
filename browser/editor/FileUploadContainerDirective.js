    edMod.directive('dranFileUploadContainer', function () {
        return {
            restrict: 'AE',
            link: function (scope, element) {
                var input = element.find('input');
                var button = element.find('button');
                if (input.length && button.length) {
                    button.bind('click', function (ev) {
                        input[0].click();
                    });
                }
                ;
            }
        };
    });

