export default [StageContainer];

const StageContainer = () => {
  return {
    restrict: 'AE',
    link: function (scope, element) {
      // FIXME: this is where they were loading model before, which is instantiated with new Dranimate();
      model.setup(element[0]);
    }
  };
};
