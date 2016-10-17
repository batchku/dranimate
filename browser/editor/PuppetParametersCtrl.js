// TODO: Maybe get rid of everything defined outside of the controller's scope?
// module.exports is after these declarations

var nullDefaults = {
  x: 0,
  y: 0,
  scaleX: 100,
  scaleY: 100,
  rotation: 0
};

var configDefaults = {
  limit: function(v) { return v; },
  transToCtrl: function(v) { return v; },
  transFromCtrl: function(v) { return v; }
};

function mkGenericGetterSetter(model) {
  return function(attr, config) {
    var limit =
      config === undefined || config.limit === undefined
      ? configDefaults.limit
      : config.limit;
    var transToCtrl =
      config === undefined || config.transToCtrl === undefined
      ? configDefaults.transToCtrl
      : config.transToCtrl;
    var transFromCtrl =
      config === undefined || config.transFromCtrl === undefined
      ? configDefaults.transFromCtrl
      : config.transFromCtrl;
    return function(newVal) {
      var selectedPuppet = model.getSelectedPuppet();
      if (selectedPuppet === null) return nullDefaults[attr];
      else {
        if (arguments.length) {
          selectedPuppet[attr] = newVal === null
            ? nullDefaults[attr]
            : transFromCtrl(limit(newVal));
        } else {
          return transToCtrl(selectedPuppet[attr]);
        };
      };
    };
  };
};

function mkRestrict(min, max) {
  return function(num) {
    return Math.max(Math.min(num, max), min);
  };
};

module.exports = ['model', PuppetParametersCtrl];

function PuppetParametersCtrl(model) {
  var mkGetterSetter = mkGenericGetterSetter(model);

  $scope.x = mkGetterSetter('x', { transToCtrl: Math.round });
  $scope.y = mkGetterSetter('y', { transToCtrl: Math.round });
  $scope.scaleX = mkGetterSetter('scaleX', {
    limit: mkRestrict(1, 300),
    transToCtrl: function(v) {
      return Math.round(v * 100);
    },
    transFromCtrl: function(v) {
      return v / 100;
    },
  });
  $scope.scaleY = mkGetterSetter('scaleY', {
    limit: mkRestrict(1, 300),
    transToCtrl: function(v) {
      return Math.round(v * 100);
    },
    transFromCtrl: function(v) {
      return v / 100;
    },
  });
  $scope.rotation = mkGetterSetter('rotation', { limit: mkRestrict(-180, 180) });

  $scope.noPuppetSelected = function() {
    return model.getSelectedPuppet() === null;
  };

  $scope.deleteSelectedPuppet = model.deleteSelectedPuppet;
}
