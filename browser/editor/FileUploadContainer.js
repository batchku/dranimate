module.exports = [FileUploadContainer];

function FileUploadContainer() {
  return {
    restrict: 'E',
    link: ($scope, $element) => {
      var $input = $element.find('input');
      var button = $element.find('button');

      if ($input.length && button.length) {
        button.bind('click', () => {
          $input[0].click();
        });
      }
    },
  };
}
