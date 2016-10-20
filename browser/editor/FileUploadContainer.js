module.exports = [FileUploadContainer];

function FileUploadContainer() {
  return {
    restrict: 'E',
    link: function($scope, $element) {
      var $input = $element.find('input');
      var button = $element.find('button');

      if ($input.length && button.length) {
        button.bind('click', function() {
          $input[0].click();
        });
      }
    },
  };
}
