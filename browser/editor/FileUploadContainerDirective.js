export default [FileUploadContainer];

const FileUploadContainer = () => {
  return {
    restrict: 'E',
    link: ($scope, $element) => {
      const $input = $element.find('input');
      const button = $element.find('button');

      if ($input.length && button.length) {
        button.bind('click', () => {
          $input[0].click();
        });
      }
    },
  };
}
