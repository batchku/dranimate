webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(135);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _styles = _interopRequireDefault(__webpack_require__(137));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Button =
/*#__PURE__*/
function (_Component) {
  _inherits(Button, _Component);

  function Button(props) {
    _classCallCheck(this, Button);

    return _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, props));
  }

  _createClass(Button, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("button", {
        className: "".concat(_styles.default.button, " ").concat(this.props.className),
        onClick: this.props.onClick
      }, this.props.children);
    }
  }]);

  return Button;
}(_react.Component);

Button.propTypes = {
  onClick: _propTypes.default.func.isRequired
};
var _default = Button;
exports.default = _default;

/***/ }),
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadImage;

function loadImage(imageSource) {
  return new Promise(function (resolve, reject) {
    try {
      var image = new Image();

      image.onload = function () {
        return resolve(image);
      };

      image.onerror = function (error) {
        return reject(error);
      };

      image.src = imageSource;
    } catch (error) {
      reject(error);
    }
  });
}

/***/ }),
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractForeground = extractForeground;
exports.getImageDataFromImage = getImageDataFromImage;

var _imageLoader = _interopRequireDefault(__webpack_require__(18));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getImageDataFromImage(image, w, h) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = w || image.width;
  canvas.height = h || image.height;
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function extractForeground(originalImageData, imageNoBackgroundData) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = originalImageData.width;
  canvas.height = originalImageData.height;

  for (var i = 0; i < imageNoBackgroundData.data.length; i += 4) {
    if (imageNoBackgroundData.data[i + 3] !== 255) {
      originalImageData.data[i] = 0;
      originalImageData.data[i + 1] = 0;
      originalImageData.data[i + 2] = 0;
      originalImageData.data[i + 3] = 0;
    }
  }

  context.putImageData(originalImageData, 0, 0);
  return (0, _imageLoader.default)(canvas.toDataURL('image/png'));
}

/***/ }),
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateUniqueId;
var uuidSet = new Set();

function generateId() {
  return (Math.random() * Math.pow(2, 32 - 1) >>> 0) + '';
}

function generateUniqueId() {
  var id = generateId();

  while (uuidSet.has(id)) {
    id = generateId();
  }

  uuidSet.add(id);
  return id;
}

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _styles = _interopRequireDefault(__webpack_require__(142));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Slider =
/*#__PURE__*/
function (_Component) {
  _inherits(Slider, _Component);

  function Slider(props) {
    var _this;

    _classCallCheck(this, Slider);

    _this = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, props));

    _this.onChange = function (event) {
      return _this.props.onChange(event.target.value);
    };

    _this.onChangeEnd = function (event) {
      if (!_this.props.onChangeEnd) {
        return;
      }

      _this.props.onChangeEnd(event.target.value);
    };

    return _this;
  }

  _createClass(Slider, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", null, _react.default.createElement("input", {
        type: "range",
        min: this.props.min,
        max: this.props.max,
        defaultValue: this.props.defaultValue,
        onChange: this.onChange,
        onMouseUp: this.onChangeEnd,
        onTouchEnd: this.onChangeEnd
      }));
    }
  }]);

  return Slider;
}(_react.Component);

Slider.propTypes = {
  min: _propTypes.default.number.isRequired,
  max: _propTypes.default.number.isRequired,
  onChange: _propTypes.default.func.isRequired,
  onChangeEnd: _propTypes.default.func
};
var _default = Slider;
exports.default = _default;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PanHandler =
/*#__PURE__*/
function () {
  function PanHandler() {
    _classCallCheck(this, PanHandler);

    this.isEnabled = false;
    this.needsUpdate = false;
    this.panPosition = {
      x: 0,
      y: 0
    };
    this.panFromPosition = {
      x: 0,
      y: 0
    };
  }

  _createClass(PanHandler, [{
    key: "setPanEnabled",
    value: function setPanEnabled(isEnabled) {
      this.isEnabled = isEnabled;
    }
  }, {
    key: "getPanEnabled",
    value: function getPanEnabled() {
      return this.isEnabled;
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown(x, y, zoom) {
      if (!this.isEnabled) {
        return;
      }

      this.panFromPosition.x = x / zoom;
      this.panFromPosition.y = y / zoom;
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(x, y, zoom) {
      if (!this.isEnabled) {
        return;
      }

      this.panPosition.x += x / zoom - this.panFromPosition.x;
      this.panPosition.y += y / zoom - this.panFromPosition.y;
      this.panFromPosition.x = x / zoom;
      this.panFromPosition.y = y / zoom;
      this.needsUpdate = true;
    }
  }, {
    key: "getPanPosition",
    value: function getPanPosition() {
      return this.panPosition;
    }
  }, {
    key: "update",
    value: function update(camera) {
      if (!this.isEnabled || !this.needsUpdate) {
        return;
      }

      camera.position.x = -this.panPosition.x;
      camera.position.y = -this.panPosition.y;
      this.needsUpdate = false;
    }
  }]);

  return PanHandler;
}();

exports.default = PanHandler;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(148);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = clamp;
exports.pointIsInsideTriangle = pointIsInsideTriangle;
exports.getDistance = getDistance;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sign(x1, y1, x2, y2, x3, y3) {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
} //http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle


function pointIsInsideTriangle(x, y, p1, p2, p3) {
  var b1 = sign(x, y, p1.x, p1.y, p2.x, p2.y) < 0.0;
  var b2 = sign(x, y, p2.x, p2.y, p3.x, p3.y) < 0.0;
  var b3 = sign(x, y, p3.x, p3.y, p1.x, p1.y) < 0.0;
  return b1 === b2 && b2 === b3;
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _three = __webpack_require__(8);

var _mouseHandler = _interopRequireDefault(__webpack_require__(151));

var _leapHandler = _interopRequireDefault(__webpack_require__(152));

var _touchHandler = _interopRequireDefault(__webpack_require__(153));

var _GifRecorder = _interopRequireDefault(__webpack_require__(154));

var _panHandler = _interopRequireDefault(__webpack_require__(38));

var _math = __webpack_require__(40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ZOOM = {
  MIN: 0.1,
  MAX: 3
};
var CAMERA_DEPTH = 100;

var Dranimate = function Dranimate() {
  var container;
  var camera, scene, renderer;
  var puppets = [];
  var zoom = 1.0;
  var panHandler = new _panHandler.default();
  var leapHandler;
  var mouseHandler;
  var touchHandler;
  var lastUpdateTimestamp = performance.now();
  var isInRenderLoop = true;
  var isRecording = false;
  var gifIsRecording = false;
  var gifRecorder;

  var getSelectedPuppet = function getSelectedPuppet() {
    return mouseHandler.getSelectedPuppet() || touchHandler.getSelectedPuppet();
  };
  /*****************************
      API
  *****************************/


  this.setup = function (canvasContainer) {
    /* Initialize THREE canvas and scene */
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2; // OrthographicCamera: left, right, top, bottom, near, far
    // puppet.z = 0, controlPoint.z = 10

    camera = new _three.OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, CAMERA_DEPTH - 10, CAMERA_DEPTH + 1);
    scene = new _three.Scene();
    renderer = new _three.WebGLRenderer({
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio); // renderer.setSize(width, height);

    renderer.setClearColor(0xFFFFFF, 1);
    canvasContainer.appendChild(renderer.domElement);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = CAMERA_DEPTH;
    mouseHandler = new _mouseHandler.default(renderer.domElement, panHandler);
    touchHandler = new _touchHandler.default(renderer.domElement, panHandler);
    leapHandler = new _leapHandler.default(renderer.domElement, panHandler, puppets);
    var gridHelper = new _three.GridHelper(1000, 20);
    gridHelper.geometry.rotateX(Math.PI / 2);
    scene.add(gridHelper);
    refreshCamera();
    animate();
  };

  this.onMouseWheel = function (event) {
    var d = typeof e.wheelDelta != "undefined" ? -e.wheelDelta : e.detail;
    d *= 0.01;
    zoom += d;
    zoom = (0, _math.clamp)(zoom, ZOOM.MIN, ZOOM.MAX);
    refreshCamera();
  };

  this.onMouseDown = function (event) {
    return mouseHandler.onMouseDown(event, puppets, zoom);
  };

  this.onMouseMove = function (event) {
    return mouseHandler.onMouseMove(event, puppets, zoom);
  };

  this.onMouseUp = function (event) {
    return mouseHandler.onMouseUp(event, puppets, zoom);
  };

  this.onTouchStart = function (event) {
    return touchHandler.onTouchStart(event, puppets, zoom);
  };

  this.onTouchMove = function (event) {
    return touchHandler.onTouchMove(event, puppets, zoom);
  };

  this.onTouchEnd = function (event) {
    return touchHandler.onTouchEnd(event, puppets, zoom);
  }; // this.createNewPuppet = function (vertices, faces, controlPoints, image, imageNoBG) {
  //
  //     /* Create the new Puppet */
  //
  //     var puppet = new Puppet(image, imageNoBG);
  //     puppet.generateMesh(vertices, faces, controlPoints, scene);
  //     puppets.push(puppet);
  //
  // }


  this.addPuppet = function (p) {
    var matchingIndex = puppets.findIndex(function (puppet) {
      return puppet.id === p.id;
    });

    if (matchingIndex > -1) {
      this.removePuppetByIndex(matchingIndex);
    }

    puppets.push(p);
    scene.add(p.group);
  };

  this.zoomIn = function () {
    zoom += 0.1;
    zoom = (0, _math.clamp)(zoom, ZOOM.MIN, ZOOM.MAX); //panPosition.x -= (0.1)*window.innerWidth/2;
    //panPosition.y -= (0.1)*window.innerHeight/2;

    refreshCamera();
    camera.updateProjectionMatrix();
  };

  this.zoomOut = function () {
    zoom -= 0.1;
    zoom = (0, _math.clamp)(zoom, ZOOM.MIN, ZOOM.MAX); //panPosition.x += (0.1)*window.innerWidth/2;
    //panPosition.y += (0.1)*window.innerHeight/2;

    refreshCamera();
    camera.updateProjectionMatrix();
  };

  this.setPanEnabled = function (isEnabled) {
    panHandler.setPanEnabled(isEnabled);
    renderer.domElement.style.cursor = isEnabled ? 'move' : 'default';
  };

  this.deleteSelectedPuppet = function () {
    var selectedPuppet = getSelectedPuppet();

    if (!selectedPuppet) {
      return;
    }

    var index = puppets.indexOf(selectedPuppet);
    this.removePuppetByIndex(index);
    mouseHandler.onRemovePuppet();
    touchHandler.onRemovePuppet();
  };

  this.removePuppetByIndex = function (index) {
    var puppet = puppets[index];

    if (!puppet) {
      return;
    }

    puppet.cleanup();
    scene.remove(puppet.group);
    puppets.splice(index, 1);
  };

  this.getSelectedPuppet = function () {
    return getSelectedPuppet();
  };

  this.setRecording = function (isRec) {
    isRecording = isRec;

    if (getSelectedPuppet()) {
      isRecording ? getSelectedPuppet().startRecording() : getSelectedPuppet().stopRecording();
    }
  };

  this.setGifIsRecording = function (isRec) {
    gifIsRecording = isRec;
    isInRenderLoop = gifIsRecording;

    if (gifIsRecording) {
      gifRecorder = new _GifRecorder.default();
    } else {
      console.log('start exporting gif');
      render();
      gifRecorder.stop(renderer.domElement).then(function (objectUrl) {
        return window.open(objectUrl);
      }).catch(function (error) {
        return console.log('gif error', error);
      });
    }
  };

  this.onRenderToggle = function () {
    isInRenderLoop = !isInRenderLoop;

    if (isInRenderLoop) {
      animate();
    }
  }; // this.startRenderLoop = () => {
  //   isInRenderLoop = true;
  //   this.animate();
  // };
  //
  // this.stopRenderLoop = () => {
  //   isInRenderLoop = false;
  // };

  /*****************************
      Dom events
  *****************************/


  window.addEventListener('resize', function ($event) {
    return refreshCamera();
  }, false);
  /*****************************
      Draw/update loop
  *****************************/

  function refreshCamera() {
    var width = window.innerWidth / 2 / zoom;
    var height = window.innerHeight / 2 / zoom;
    camera.left = -width;
    camera.right = width;
    camera.top = -height;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    var now = performance.now();
    var elapsedTime = now - lastUpdateTimestamp;
    lastUpdateTimestamp = now;
    update(elapsedTime);
    render(elapsedTime);

    if (isInRenderLoop) {
      requestAnimationFrame(animate);
    }
  }

  function update(elapsedTime) {
    leapHandler.update(getSelectedPuppet());
    puppets.forEach(function (puppet) {
      return puppet.update(elapsedTime, isRecording);
    });
    panHandler.update(camera);
  }

  function render(elapsedTime) {
    renderer.render(scene, camera);

    if (gifIsRecording) {
      gifRecorder.offerFrame(renderer.domElement);
    }
  }
};

var dranimate = new Dranimate();
var _default = dranimate;
exports.default = _default;

/***/ }),
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _loader = _interopRequireDefault(__webpack_require__(67));

var _ImageEditor = _interopRequireDefault(__webpack_require__(136));

var _ControlPointEditor = _interopRequireDefault(__webpack_require__(149));

var _slider = _interopRequireDefault(__webpack_require__(37));

var _dranimate = _interopRequireDefault(__webpack_require__(41));

var _PuppetEditorStateService = _interopRequireDefault(__webpack_require__(70));

var _uuid = _interopRequireDefault(__webpack_require__(36));

var _generateMesh = __webpack_require__(155);

var _ImageUtil = __webpack_require__(24);

var _imageLoader = _interopRequireDefault(__webpack_require__(18));

var _styles = _interopRequireDefault(__webpack_require__(39));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STEPS = {
  IMAGE: 'IMAGE',
  CONTROL_POINT: 'CONTROL_POINT'
};

var PuppetEditor =
/*#__PURE__*/
function (_Component) {
  _inherits(PuppetEditor, _Component);

  function PuppetEditor(props) {
    var _this;

    _classCallCheck(this, PuppetEditor);

    _this = _possibleConstructorReturn(this, (PuppetEditor.__proto__ || Object.getPrototypeOf(PuppetEditor)).call(this, props));

    _this.onClose = function () {
      return _this.props.onClose();
    };

    _this.onImageEditorNext = function (backgroundRemovalData) {
      _this.setState({
        step: STEPS.CONTROL_POINT,
        backgroundRemovalData: backgroundRemovalData
      });
    };

    _this.onControlPointEditorBack = function () {
      _this.setState({
        step: STEPS.IMAGE
      });
    };

    _this.onSave = function (controlPointPositions) {
      if (controlPointPositions.length < 2) {
        alert('Puppet must have at least two control points');
        return;
      }

      var puppetId = _PuppetEditorStateService.default.isPuppet ? _PuppetEditorStateService.default.getItem().id : (0, _uuid.default)();
      (0, _imageLoader.default)(_this.state.imageSrc).then(function (imageElement) {
        var _this$state$backgroun = _this.state.backgroundRemovalData,
            width = _this$state$backgroun.width,
            height = _this$state$backgroun.height;
        var originalImageData = (0, _ImageUtil.getImageDataFromImage)(imageElement, width, height);
        return (0, _generateMesh.generateMesh)(puppetId, imageElement, _this.state.backgroundRemovalData, originalImageData, controlPointPositions);
      }).then(function (puppet) {
        if (puppet) {
          _dranimate.default.addPuppet(puppet);
        }

        _this.onClose();
      });
    };

    _this.state = {
      loaderIsVisible: false,
      step: STEPS.IMAGE,
      imageSrc: null,
      backgroundRemovalData: null,
      controlPointPositions: null
    };
    return _this;
  }

  _createClass(PuppetEditor, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      if (_PuppetEditorStateService.default.isPuppet) {
        var puppet = _PuppetEditorStateService.default.getItem();

        this.setState({
          imageSrc: puppet.image.src,
          backgroundRemovalData: puppet.backgroundRemovalData || null,
          controlPointPositions: puppet.controlPointPositions
        });
      } else {
        this.setState({
          imageSrc: _PuppetEditorStateService.default.getItem()
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: _styles.default.scrim
      }, _react.default.createElement("div", {
        className: _styles.default.puppetEditor
      }, this.state.step === STEPS.IMAGE ? _react.default.createElement(_ImageEditor.default, {
        imageSrc: this.state.imageSrc,
        backgroundRemovalData: this.state.backgroundRemovalData,
        onCancel: this.onClose,
        onNext: this.onImageEditorNext
      }) : _react.default.createElement(_ControlPointEditor.default, {
        imageSrc: this.state.imageSrc,
        backgroundRemovalData: this.state.backgroundRemovalData,
        controlPointPositions: this.state.controlPointPositions,
        onClose: this.onControlPointEditorBack,
        onSave: this.onSave
      }), _react.default.createElement(_loader.default, {
        isVisible: this.state.loaderIsVisible
      })));
    }
  }]);

  return PuppetEditor;
}(_react.Component);

PuppetEditor.propTypes = {
  onClose: _propTypes.default.func.isRequired,
  puppet: _propTypes.default.object,
  imageSrc: _propTypes.default.string
};
var _default = PuppetEditor;
exports.default = _default;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _styles = _interopRequireDefault(__webpack_require__(133));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Loader =
/*#__PURE__*/
function (_Component) {
  _inherits(Loader, _Component);

  function Loader(props) {
    _classCallCheck(this, Loader);

    return _possibleConstructorReturn(this, (Loader.__proto__ || Object.getPrototypeOf(Loader)).call(this, props));
  }

  _createClass(Loader, [{
    key: "showLoader",
    value: function showLoader() {
      return _react.default.createElement("div", {
        className: _styles.default.scrim
      }, _react.default.createElement("div", {
        className: _styles.default.test
      }, _react.default.createElement("div", null, _react.default.createElement("div", {
        className: _styles.default.loaderDots
      }))));
    }
  }, {
    key: "render",
    value: function render() {
      if (this.props.isVisible) {
        return this.showLoader();
      }

      return null;
    }
  }]);

  return Loader;
}(_react.Component);

Loader.propTypes = {
  isVisible: _propTypes.default.bool.isRequired
};
var _default = Loader;
exports.default = _default;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _styles = _interopRequireDefault(__webpack_require__(144));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ZoomPanner =
/*#__PURE__*/
function (_Component) {
  _inherits(ZoomPanner, _Component);

  function ZoomPanner(props) {
    var _this;

    _classCallCheck(this, ZoomPanner);

    _this = _possibleConstructorReturn(this, (ZoomPanner.__proto__ || Object.getPrototypeOf(ZoomPanner)).call(this, props));

    _this.onPanClick = function () {
      var panIsSelected = !_this.state.panIsSelected;

      _this.props.onPanSelect(panIsSelected);

      _this.setState({
        panIsSelected: panIsSelected
      });
    };

    _this.state = {
      panIsSelected: false
    };
    return _this;
  }

  _createClass(ZoomPanner, [{
    key: "renderPanButton",
    value: function renderPanButton() {
      return _react.default.createElement(_button.default, {
        className: this.state.panIsSelected ? _styles.default.panActive : _styles.default.pan,
        onClick: this.onPanClick
      }, "Pan");
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return _react.default.createElement("div", {
        className: this.props.className
      }, this.props.onPanSelect ? this.renderPanButton() : null, _react.default.createElement(_button.default, {
        className: _styles.default.zoomButton,
        onClick: function onClick() {
          return _this2.props.onZoomSelect(true);
        }
      }, "Zoom In"), _react.default.createElement(_button.default, {
        className: _styles.default.zoomButton,
        onClick: function onClick() {
          return _this2.props.onZoomSelect(false);
        }
      }, "Zoom Out"));
    }
  }]);

  return ZoomPanner;
}(_react.Component);

ZoomPanner.propTypes = {
  onPanSelect: _propTypes.default.func,
  onZoomSelect: _propTypes.default.func.isRequired
};
var _default = ZoomPanner;
exports.default = _default;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPuppetAndControlPointFromPostion = getPuppetAndControlPointFromPostion;

var _three = __webpack_require__(8);

function getPuppetAndControlPointFromPostion(puppets, x, y, distanceThreshold, zoom) {
  var activeControlPoint;

  var _loop = function _loop() {
    // WHY LOOP OVER ALL PUPPETS?
    var puppet = puppets[p];
    var verts = puppet.threeMesh.geometry.vertices;
    var controlPoints = puppet.controlPoints;
    var closeControlPointIndex = controlPoints.findIndex(function (controlPoint, index) {
      var mouseVector = new _three.Vector2(x, y); // .multiplyScalar(1 / puppet.getScale())
      // .rotateAround(puppet.getCenter(), -puppet.getRotation());
      // const mouseVector = new Vector2(x / puppet.getScale(), y / puppet.getScale());
      // mouseVector.rotateAround(puppet.getCenter(), -puppet.getRotation());

      var vert = verts[controlPoint];
      var dist = vert.distanceTo(new _three.Vector3(mouseVector.x, mouseVector.y, 0)); //TODO: vector2?

      return dist < distanceThreshold * zoom;
    });

    if (closeControlPointIndex > -1) {
      activeControlPoint = {
        valid: true,
        puppetIndex: p,
        hoveredOver: true,
        beingDragged: false,
        controlPointIndex: closeControlPointIndex
      };
    }
  };

  for (var p = 0; p < puppets.length; p++) {
    _loop();
  }

  return activeControlPoint;
}

;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PuppetEditorStateService =
/*#__PURE__*/
function () {
  function PuppetEditorStateService() {
    _classCallCheck(this, PuppetEditorStateService);

    this.isPuppet = false;
    this.item;
  }

  _createClass(PuppetEditorStateService, [{
    key: "setItem",
    value: function setItem(item) {
      var itemIsPuppet = item && item.name;
      this.item = item;
      this.isPuppet = itemIsPuppet;
    }
  }, {
    key: "getItem",
    value: function getItem() {
      return this.item;
    }
  }]);

  return PuppetEditorStateService;
}();

var puppetEditorStateService = new PuppetEditorStateService();
var _default = puppetEditorStateService;
exports.default = _default;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requestPuppetCreation;

var _three = __webpack_require__(8);

var _puppet = _interopRequireDefault(__webpack_require__(157));

var _uuid = _interopRequireDefault(__webpack_require__(36));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

// Temporary guard against this nasty guy: https://github.com/cmuartfab/dranimate-browser_archive/issues/1
var errorMessage = 'Must load largest puppet first.';
var mostFaces = 0; //------- LOGIC FOR BUILDING PUPPETS, THIS IS TO KEEP CONSTRUCTION OUTSIDE OF PUPPET ENTITY ------//

function buildFromOptions(options) {
  var image = options.image;
  var id = options.id || (0, _uuid.default)();
  var verts = options.vertices;
  var faces = options.faces;
  var controlPoints = options.controlPoints;
  var imageNoBG = options.imageNoBG;
  /* Generate wireframe material */

  var wireframeMaterial = new _three.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true,
    wireframeLinewidth: 1
  });
  /* Generate image material */

  var canvas = document.createElement('canvas');
  canvas.width = imageNoBG.width;
  canvas.height = imageNoBG.height;
  var context = canvas.getContext('2d'); // canvas.getContext('2d');

  context.drawImage(imageNoBG, 0, 0, imageNoBG.width, imageNoBG.height, 0, 0, canvas.width, canvas.height);
  var geometry = new _three.Geometry();
  var imageTexture = new _three.Texture(canvas);
  imageTexture.needsUpdate = true;
  var texturedMaterial = new _three.MeshBasicMaterial({
    map: imageTexture,
    transparent: true
  });
  var vertsFlatArray = verts.reduce(function (flatArray, vert) {
    return flatArray.concat(vert[0], vert[1]);
  }, []);
  var facesFlatArray = faces.map(function (face) {
    return face;
  }); // add geometry vertices

  verts.map(function (vertex) {
    return new _three.Vector3(vertex[0], vertex[1], 0);
  }).forEach(function (vertex) {
    return geometry.vertices.push(vertex);
  });

  for (var i = 0; i < facesFlatArray.length; i += 3) {
    var f1 = facesFlatArray[i];
    var f2 = facesFlatArray[i + 1];
    var f3 = facesFlatArray[i + 2];
    geometry.faces.push(new _three.Face3(f1, f2, f3));
    geometry.faceVertexUvs[0].push([new _three.Vector2(geometry.vertices[f1].x / imageNoBG.width, 1 - geometry.vertices[f1].y / imageNoBG.height), new _three.Vector2(geometry.vertices[f2].x / imageNoBG.width, 1 - geometry.vertices[f2].y / imageNoBG.height), new _three.Vector2(geometry.vertices[f3].x / imageNoBG.width, 1 - geometry.vertices[f3].y / imageNoBG.height)]);
  }

  geometry.dynamic = true; // geometry.translate(-200, -200, 0);

  /* Expand mesh to show finer edges of image (as opposed to rough triangle edges of mesh) */

  console.log("TODO: expand mesh");
  var threeMesh = new _three.Mesh(geometry, texturedMaterial);
  var boundingBox = new _three.BoxHelper(threeMesh, new _three.Color(0xFF9900));
  boundingBox.visible = false;
  var box3 = new _three.Box3();
  box3.setFromObject(boundingBox);
  var size = box3.getSize(new _three.Vector3());
  var halfSize = new _three.Vector2(size.x, size.y).multiplyScalar(0.5);
  geometry.translate(-halfSize.x, -halfSize.y, 0);
  var controlPointSpheres = controlPoints.map(function () {
    var sphere = new _three.Mesh(new _three.SphereGeometry(15, 32, 32), new _three.MeshBasicMaterial({
      color: 0xFFAB40
    }));
    sphere.position.z = 10;
    return sphere;
  }); // FOR TESTING THE CENTER OF THE PUPPET:

  var centerSphere = new _three.Mesh(new _three.SphereGeometry(15, 32, 32), new _three.MeshBasicMaterial({
    color: 0x3300FF
  }));
  centerSphere.position.z = 20;
  var group = new _three.Group();
  group.add(threeMesh);
  group.add(boundingBox); // group.add(centerSphere);

  controlPointSpheres.forEach(function (cp) {
    return group.add(cp);
  });
  return {
    image: image,
    id: id,
    wireframeMaterial: wireframeMaterial,
    texturedMaterial: texturedMaterial,
    verts: verts,
    faces: faces,
    controlPoints: controlPoints,
    vertsFlatArray: vertsFlatArray,
    facesFlatArray: facesFlatArray,
    threeMesh: threeMesh,
    boundingBox: boundingBox,
    controlPointSpheres: controlPointSpheres,
    group: group,
    halfSize: halfSize,
    centerSphere: centerSphere
  };
}

function requestPuppetCreation(options) {
  console.log('requestPuppetCreation', options);

  if (!mostFaces) {
    mostFaces = options.faces.length;
  }

  if (options.faces.length > mostFaces) {
    alert(errorMessage);
    return false;
  }

  var puppetData = _extends({
    imageNoBG: options.imageNoBG,
    controlPointPositions: options.controlPointPositions,
    backgroundRemovalData: options.backgroundRemovalData
  }, buildFromOptions(options));

  return new _puppet.default(puppetData);
}

/***/ }),
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = _interopRequireDefault(__webpack_require__(0));

var _reactDom = _interopRequireDefault(__webpack_require__(51));

var _app = _interopRequireDefault(__webpack_require__(132));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom.default.render(_react.default.createElement(_app.default, null), document.getElementById('root'));

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _reactRouterDom = __webpack_require__(58);

var _puppetEditor = _interopRequireDefault(__webpack_require__(66));

var _stage = _interopRequireDefault(__webpack_require__(160));

var _baseStyles = _interopRequireDefault(__webpack_require__(184));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App =
/*#__PURE__*/
function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: "render",
    value: function render() {
      return _react.default.createElement(_reactRouterDom.BrowserRouter, null, _react.default.createElement("div", null, _react.default.createElement(_reactRouterDom.Route, {
        component: _stage.default
      })));
    }
  }]);

  return App;
}(_react.Component);

var _default = App;
exports.default = _default;

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(134);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__scrim___EZv2c {\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.25);\n  display: flex;\n  justify-content: space-around;\n  align-items: center; }\n\n.styles__test___2YuTC {\n  background-color: #616161;\n  width: 150px;\n  height: 45px;\n  border-radius: 4px;\n  padding-top: 15px; }\n\n.styles__loaderDots___2DvOM,\n.styles__loaderDots___2DvOM:before,\n.styles__loaderDots___2DvOM:after {\n  border-radius: 50%;\n  width: 25px;\n  height: 25px;\n  animation-fill-mode: both;\n  animation: styles__loaderkeyframes___344QQ 1.8s infinite ease-in-out; }\n\n.styles__loaderDots___2DvOM {\n  color: #FFF;\n  margin: -25px auto 25px auto;\n  transform: translateZ(0);\n  animation-delay: -0.16s; }\n\n.styles__loaderDots___2DvOM:before,\n.styles__loaderDots___2DvOM:after {\n  content: '';\n  position: absolute;\n  top: 0; }\n\n.styles__loaderDots___2DvOM:before {\n  left: -35px;\n  animation-delay: -0.32s; }\n\n.styles__loaderDots___2DvOM:after {\n  left: 35px; }\n\n@keyframes styles__loaderkeyframes___344QQ {\n  0%,\n  80%,\n  100% {\n    box-shadow: 0 25px 0 -12.5px; }\n  40% {\n    box-shadow: 0 25px 0 0; } }\n", ""]);

// exports
exports.locals = {
	"scrim": "styles__scrim___EZv2c",
	"test": "styles__test___2YuTC",
	"loaderDots": "styles__loaderDots___2DvOM",
	"loaderkeyframes": "styles__loaderkeyframes___344QQ"
};

/***/ }),
/* 135 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _checkbox = _interopRequireDefault(__webpack_require__(139));

var _loader = _interopRequireDefault(__webpack_require__(67));

var _slider = _interopRequireDefault(__webpack_require__(37));

var _zoomPanner = _interopRequireDefault(__webpack_require__(68));

var _imageEditorService = _interopRequireDefault(__webpack_require__(146));

var _styles = _interopRequireDefault(__webpack_require__(39));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImageEditor =
/*#__PURE__*/
function (_Component) {
  _inherits(ImageEditor, _Component);

  function ImageEditor(props) {
    var _this;

    _classCallCheck(this, ImageEditor);

    _this = _possibleConstructorReturn(this, (ImageEditor.__proto__ || Object.getPrototypeOf(ImageEditor)).call(this, props));

    _this.runSlic = function () {
      console.log('.......runslic');

      _this.setState({
        loaderIsVisible: true
      });

      setTimeout(function () {
        _this.imageEditorService.doSlic(_this.state.threshold);

        _this.setState({
          loaderIsVisible: false
        });
      });
    };

    _this.updateThresholdUi = function (threshold) {
      return _this.setState({
        threshold: threshold
      });
    };

    _this.onZoomSelect = function (isZoomIn) {
      return isZoomIn ? _this.imageEditorService.zoomIn() : _this.imageEditorService.zoomOut();
    };

    _this.onCanvasSelectType = function (event) {
      var selector = event.target.checked ? 'SELECT' : 'DESELECT';

      _this.imageEditorService.setSelectState(selector);

      _this.setState({
        selector: selector
      });
    };

    _this.onEraseDrawChange = function (eraseDraw) {
      var selector = eraseDraw ? 'SELECT' : 'DESELECT';

      _this.setState({
        eraseDraw: eraseDraw
      });

      _this.imageEditorService.setSelectState(selector);
    };

    _this.onNext = function () {
      var imageForegroundSelection = _this.imageEditorService.getImageForegroundSelection();

      _this.props.onNext(imageForegroundSelection);
    };

    _this.state = {
      eraseDraw: true,
      selector: 'SELECT',
      threshold: 30,
      loaderIsVisible: false,
      step: 0
    };
    return _this;
  }

  _createClass(ImageEditor, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.imageEditorService = new _imageEditorService.default();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.canvasElement.width = 400;
      this.canvasElement.height = 300;
      this.imageEditorService.init(this.canvasElement, this.props.imageSrc, this.props.backgroundRemovalData).then(function () {
        return _this2.runSlic();
      }).catch(function (error) {
        return console.log('error', error);
      }); // passive touch event listeners seem to be needed, which react does not support

      this.canvasElement.addEventListener('touchmove', function (event) {
        return _this2.imageEditorService.onTouchMove(event);
      }, {
        passive: false
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return _react.default.createElement("div", null, _react.default.createElement("div", {
        className: _styles.default.editorNav
      }, _react.default.createElement(_button.default, {
        onClick: this.props.onCancel,
        className: _styles.default.navButton
      }, "Cancel"), _react.default.createElement(_button.default, {
        onClick: this.onNext,
        className: _styles.default.navButton
      }, "Next")), _react.default.createElement("div", null, _react.default.createElement("canvas", {
        className: _styles.default.editorCanvas,
        ref: function ref(input) {
          return _this3.canvasElement = input;
        },
        onMouseMove: this.imageEditorService.onMouseMove,
        onMouseDown: this.imageEditorService.onMouseDown,
        onContextMenu: this.imageEditorService.onContextMenu,
        onMouseUp: this.imageEditorService.onMouseUp,
        onMouseOut: this.imageEditorService.onMouseOut,
        onMouseOver: this.imageEditorService.onMouseOver,
        onTouchStart: this.imageEditorService.onTouchStart,
        onTouchEnd: this.imageEditorService.onTouchEnd,
        onDoubleClick: this.imageEditorService.onDoubleClick
      }), _react.default.createElement(_zoomPanner.default, {
        onZoomSelect: this.onZoomSelect
      })), _react.default.createElement("div", {
        className: _styles.default.editorControlParam
      }, _react.default.createElement("div", {
        className: _styles.default.editorControlRow
      }, _react.default.createElement("div", {
        className: _styles.default.editorControlLabel
      }, _react.default.createElement("p", null, "2")), _react.default.createElement("p", null, "Select Image"), _react.default.createElement("div", {
        className: "".concat(_styles.default.editorControlRow, " ").concat(_styles.default.rowSpaceAround)
      }, _react.default.createElement("div", null, _react.default.createElement(_checkbox.default, {
        defaultChecked: this.state.eraseDraw,
        onChange: this.onEraseDrawChange
      }), _react.default.createElement("p", {
        className: _styles.default.drawEraseLabel
      }, this.state.eraseDraw ? 'Draw' : 'Erase')), _react.default.createElement("div", null, _react.default.createElement("label", {
        htmlFor: "thresholdSlider"
      }, "Selection Threshold"), _react.default.createElement(_slider.default, {
        min: 20,
        max: 75,
        defaultValue: this.state.threshold,
        onChange: this.updateThresholdUi,
        onChangeEnd: this.runSlic
      }), _react.default.createElement("span", null, this.state.threshold))))));
    }
  }]);

  return ImageEditor;
}(_react.Component);

ImageEditor.propTypes = {
  onCancel: _propTypes.default.func.isRequired,
  onNext: _propTypes.default.func.isRequired,
  imageSrc: _propTypes.default.string.isRequired,
  backgroundRemovalData: _propTypes.default.object
};
var _default = ImageEditor;
exports.default = _default;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(138);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__button___2gotw {\n  color: #616161;\n  background-color: #EEE;\n  border: 1px solid #AD0034;\n  border-radius: 4px; }\n", ""]);

// exports
exports.locals = {
	"button": "styles__button___2gotw"
};

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _uuid = _interopRequireDefault(__webpack_require__(36));

var _styles = _interopRequireDefault(__webpack_require__(140));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Checkbox =
/*#__PURE__*/
function (_Component) {
  _inherits(Checkbox, _Component);

  function Checkbox(props) {
    var _this;

    _classCallCheck(this, Checkbox);

    _this = _possibleConstructorReturn(this, (Checkbox.__proto__ || Object.getPrototypeOf(Checkbox)).call(this, props));

    _this.onChange = function (event) {
      return _this.props.onChange(event.target.checked);
    };

    _this.state = {
      uniqueId: (0, _uuid.default)()
    };
    return _this;
  }

  _createClass(Checkbox, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", null, _react.default.createElement("input", {
        className: "".concat(_styles.default.checkboxInput, " ").concat(_styles.default.checkboxInputHidden),
        type: "checkbox",
        defaultChecked: this.props.defaultChecked,
        id: this.state.uniqueId,
        onChange: this.onChange
      }), _react.default.createElement("label", {
        htmlFor: this.state.uniqueId,
        className: _styles.default.checkboxLabel
      }));
    }
  }]);

  return Checkbox;
}(_react.Component);

Checkbox.propTypes = {
  defaultChecked: _propTypes.default.bool,
  onChange: _propTypes.default.func.isRequired
};
var _default = Checkbox;
exports.default = _default;

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(141);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__checkboxLabel___3MQ_D {\n  position: relative;\n  display: block;\n  height: 16px;\n  width: 32px;\n  background-color: #D8D8D8;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: background-color 0.2s ease; }\n\n.styles__checkboxInput___1bFSD:checked ~ label {\n  background-color: #FF87AA; }\n\n.styles__checkboxLabel___3MQ_D:after {\n  position: absolute;\n  left: 0;\n  top: -2px;\n  display: block;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background-color: #EEE;\n  content: '';\n  transition: left 0.2s ease; }\n\n.styles__checkboxInput___1bFSD:checked ~ label:after {\n  left: 12px;\n  background-color: #AD0034; }\n\n.styles__checkboxInputHidden___PAvSF {\n  display: none; }\n", ""]);

// exports
exports.locals = {
	"checkboxLabel": "styles__checkboxLabel___3MQ_D",
	"checkboxInput": "styles__checkboxInput___1bFSD",
	"checkboxInputHidden": "styles__checkboxInputHidden___PAvSF"
};

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(143);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, "[type='range'] {\n  -webkit-appearance: none;\n  margin: 12px 0;\n  width: 100%; }\n  [type='range']:focus {\n    outline: 0; }\n    [type='range']:focus::-webkit-slider-runnable-track {\n      background: #6e6e6e; }\n    [type='range']:focus::-ms-fill-lower {\n      background: #616161; }\n    [type='range']:focus::-ms-fill-upper {\n      background: #6e6e6e; }\n  [type='range']::-webkit-slider-runnable-track {\n    cursor: pointer;\n    height: 2px;\n    width: 100%;\n    background: #616161;\n    border-radius: 5px; }\n  [type='range']::-webkit-slider-thumb {\n    background: #AD0034;\n    border: 2px solid #FF87AA;\n    border-radius: 12px;\n    cursor: pointer;\n    height: 24px;\n    width: 24px;\n    -webkit-appearance: none;\n    margin-top: -11px; }\n  [type='range']::-moz-range-track {\n    cursor: pointer;\n    height: 2px;\n    width: 100%;\n    background: #616161;\n    border-radius: 5px; }\n  [type='range']::-moz-range-thumb {\n    background: #AD0034;\n    border: 2px solid #FF87AA;\n    border-radius: 12px;\n    cursor: pointer;\n    height: 24px;\n    width: 24px; }\n  [type='range']::-ms-track {\n    cursor: pointer;\n    height: 2px;\n    width: 100%;\n    background: transparent;\n    border-color: transparent;\n    border-width: 12px 0;\n    color: transparent; }\n  [type='range']::-ms-fill-lower {\n    background: #545454;\n    border-radius: 10px; }\n  [type='range']::-ms-fill-upper {\n    background: #616161;\n    border-radius: 10px; }\n  [type='range']::-ms-thumb {\n    background: #AD0034;\n    border: 2px solid #FF87AA;\n    border-radius: 12px;\n    cursor: pointer;\n    height: 24px;\n    width: 24px;\n    margin-top: 0; }\n", ""]);

// exports


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(145);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__pan___21gpj {\n  background-color: #EEE;\n  color: #000;\n  margin: 5px; }\n\n.styles__panActive___2OMRv {\n  background-color: #FF3571;\n  color: #FFF;\n  margin: 5px; }\n\n.styles__zoomButton___2Hz36 {\n  margin: 5px; }\n", ""]);

// exports
exports.locals = {
	"pan": "styles__pan___21gpj",
	"panActive": "styles__panActive___2OMRv",
	"zoomButton": "styles__zoomButton___2Hz36"
};

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slic = _interopRequireDefault(__webpack_require__(147));

var _ImageUtil = __webpack_require__(24);

var _imageLoader = _interopRequireDefault(__webpack_require__(18));

var _panHandler = _interopRequireDefault(__webpack_require__(38));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SELECT_STATE = {
  PAN: 'PAN',
  SELECT: 'SELECT',
  DESELECT: 'DESELECT'
};
var MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE'
};

var ImageEditorService = function ImageEditorService() {
  var _this = this;

  var that = this;
  var context;
  var width;
  var height;
  var mouse = {};
  var mouseAbs = {};
  var image;
  var originalImageData;
  var slic;
  var slicSegmentsCentroids;
  var highlightData;
  var highlightImage = new Image();
  var imageNoBackgroundData;
  var imageNoBackgroundImage = new Image();
  var dummyCanvas = document.createElement('canvas');
  var dummyContext = dummyCanvas.getContext('2d');
  var blankCanvas = document.createElement('canvas');
  var blankContext = blankCanvas.getContext('2d');
  var zoom = 1;
  var panHandler = new _panHandler.default();
  var mouseState = MOUSE_STATE.UP;
  var selectState = SELECT_STATE.SELECT;
  /*****************************
      API
  *****************************/

  this.init = function (canvas, imageData, backgroundRemovalData) {
    width = canvas.width;
    height = canvas.height;
    context = canvas.getContext('2d');
    imageNoBackgroundData = backgroundRemovalData;
    return (0, _imageLoader.default)(imageData).then(function (img) {
      var largerSize = Math.max(img.width, img.height);
      var normWidth = img.width / largerSize * 400;
      var normHeight = img.height / largerSize * 400;
      width = normWidth;
      height = normHeight;
      dummyCanvas.width = normWidth;
      dummyCanvas.height = normHeight;
      image = img;
    });
  };

  this.onMouseMove = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    var rect = event.target.getBoundingClientRect();
    mouseAbs.x = (event.clientX - rect.left) / zoom;
    mouseAbs.y = (event.clientY - rect.top) / zoom;
    mouse.x = mouseAbs.x - panHandler.getPanPosition().x;
    mouse.y = mouseAbs.y - panHandler.getPanPosition().y;
    mouse.x = Math.round(mouse.x);
    mouse.y = Math.round(mouse.y);

    if (mouseState !== MOUSE_STATE.DOWN) {
      that.updateHighligtedSuperpixel();
      redraw();
      return;
    }

    if (selectState === SELECT_STATE.PAN) {
      panHandler.onMouseMove(mouseAbs.x, mouseAbs.y, zoom);
      redraw();
      return;
    }

    if (selectState === SELECT_STATE.SELECT) {
      that.updateHighligtedSuperpixel();
      that.addSelectionToNoBackgroundImage();
    } else if (selectState === SELECT_STATE.DESELECT) {
      that.updateHighligtedSuperpixel();
      that.removeSelectionFromNoBackgroundImage();
    }
  };

  this.onMouseDown = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    mouseState = MOUSE_STATE.DOWN;
    panHandler.onMouseDown(mouseAbs.x, mouseAbs.y, zoom);

    if (selectState === SELECT_STATE.SELECT) {
      that.addSelectionToNoBackgroundImage();
    }

    if (selectState === SELECT_STATE.DESELECT) {
      that.removeSelectionFromNoBackgroundImage();
    }
  };

  this.onContextMenu = function (event) {
    event.preventDefault();
    return false;
  };

  this.onMouseUp = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    mouseState = MOUSE_STATE.UP;
  };

  this.onMouseOut = function (event) {
    event.preventDefault();
    mouseState = MOUSE_STATE.OUTSIDE;
    that.updateHighligtedSuperpixel();
  };

  this.onMouseOver = function (event) {
    event.preventDefault();

    if (mouseState !== MOUSE_STATE.DOWN) {
      mouseState = MOUSE_STATE.UP;
    }
  };

  this.onTouchStart = function (event) {
    if (event.touches.length > 1) {
      return;
    }

    var now = performance.now();

    _this.onMouseMove(event.touches[0], true); // build highlight data by forcing a "mouse hover"


    _this.onMouseDown(event.touches[0], true);
  };

  this.onTouchMove = function (event) {
    event.preventDefault();

    _this.onMouseMove(event.touches[0], true);
  };

  this.onTouchEnd = function (event) {
    if (event.touches.length) {
      return;
    }

    _this.onMouseUp(event);
  };

  this.doSlic = function (threshold) {
    this.doSLICOnImage(threshold);
    this.updateHighligtedSuperpixel();
  };

  this.zoomIn = function () {
    zoom += 0.1;
    redraw();
  };

  this.zoomOut = function () {
    zoom -= 0.1;
    redraw();
  };

  this.setSelectState = function (state) {
    selectState = state;
    panHandler.setPanEnabled(selectState === SELECT_STATE.PAN);
  };

  this.setMouseState = function (state) {
    return mouseState = state;
  };

  this.getImageForegroundSelection = function () {
    return imageNoBackgroundData;
  };
  /*****************************
      Private stuff
  *****************************/


  this.doSLICOnImage = function (threshold) {
    console.log('SLIC Start', performance.now());
    var regionSize = threshold || 30;
    originalImageData = (0, _ImageUtil.getImageDataFromImage)(image, dummyCanvas.width, dummyCanvas.height);
    slic = new _slic.default(originalImageData, {
      method: 'slic',
      regionSize: regionSize
    });

    if (!imageNoBackgroundData) {
      // we are editing a new puppet without a selection
      imageNoBackgroundData = context.createImageData(slic.result.width, slic.result.height); // imageBackgroundMaskData = context.createImageData(slic.result.width, slic.result.height);

      for (var i = 0; i < slic.result.data.length; i += 4) {
        imageNoBackgroundData.data[i] = 0;
        imageNoBackgroundData.data[i + 1] = 0;
        imageNoBackgroundData.data[i + 2] = 0;
        imageNoBackgroundData.data[i + 3] = 0;
      }
    } else {
      if (!imageNoBackgroundData.data.length) {
        console.error('Error', 'incorrect imageNoBackgroundData');
        return;
      }

      var tempNoBgData = context.createImageData(slic.result.width, slic.result.height);
      dummyContext.putImageData(imageNoBackgroundData, 0, 0);
      imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
    }

    redraw();
    console.log('SLIC Done', performance.now());
  };

  this.getEncodedSLICLabel = function (array, offset) {
    return array[offset] | array[offset + 1] << 8 | array[offset + 2] << 16;
  };

  this.addSelectionToNoBackgroundImage = function () {
    for (var i = 0; i < slic.result.data.length; i += 4) {
      if (highlightData.data[i + 3] === 255) {
        imageNoBackgroundData.data[i] = 255;
        imageNoBackgroundData.data[i + 1] = 255;
        imageNoBackgroundData.data[i + 2] = 255;
        imageNoBackgroundData.data[i + 3] = 255;
      }
    }

    dummyContext.putImageData(imageNoBackgroundData, 0, 0);
    imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
  };

  this.removeSelectionFromNoBackgroundImage = function () {
    for (var i = 0; i < slic.result.data.length; i += 4) {
      if (highlightData.data[i + 3] === 255) {
        imageNoBackgroundData.data[i] = 0;
        imageNoBackgroundData.data[i + 1] = 0;
        imageNoBackgroundData.data[i + 2] = 0;
        imageNoBackgroundData.data[i + 3] = 0;
      }
    }

    dummyContext.putImageData(imageNoBackgroundData, 0, 0);
    imageNoBackgroundImage.src = dummyCanvas.toDataURL('image/png');
  };

  this.updateHighligtedSuperpixel = function () {
    if (!slic) {
      return;
    }

    if (mouseState === MOUSE_STATE.OUTSIDE) {
      highlightImage.src = blankCanvas.toDataURL('image/png');

      highlightImage.onload = function () {
        return redraw();
      };

      return;
    }

    var selectedLabel = [];
    var selectedIndex = 4 * (mouse.y * slic.result.width + mouse.x);
    selectedLabel.push(slic.result.data[selectedIndex]);
    selectedLabel.push(slic.result.data[selectedIndex + 1]);
    selectedLabel.push(slic.result.data[selectedIndex + 2]);
    highlightData = context.createImageData(slic.result.width, slic.result.height);

    for (var i = 0; i < slic.result.data.length; i += 4) {
      if (selectedLabel[0] === slic.result.data[i] && selectedLabel[1] === slic.result.data[i + 1] && selectedLabel[2] === slic.result.data[i + 2]) {
        highlightData.data[i] = 255;
        highlightData.data[i + 1] = 0;
        highlightData.data[i + 2] = 0;
        highlightData.data[i + 3] = 255;
      } else {
        highlightData.data[i] = 255;
        highlightData.data[i + 1] = 0;
        highlightData.data[i + 2] = 0;
        highlightData.data[i + 3] = 0;
      }
    }

    dummyContext.putImageData(highlightData, 0, 0);
    highlightImage.src = dummyCanvas.toDataURL('image/png');

    highlightImage.onload = function () {
      return redraw();
    };
  };

  var redraw = function redraw() {
    if (!image) {
      return;
    }

    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(zoom, zoom);
    context.translate(panHandler.getPanPosition().x, panHandler.getPanPosition().y);
    context.globalAlpha = 1.0;
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    context.drawImage(highlightImage, 0, 0, highlightImage.width, highlightImage.height, 0, 0, width, height);
    context.globalAlpha = 0.8;
    context.drawImage(imageNoBackgroundImage, 0, 0, imageNoBackgroundImage.width, imageNoBackgroundImage.height, 0, 0, width, height);
    context.globalAlpha = 1.0;
    context.restore();
  };
};

var _default = ImageEditorService;
exports.default = _default;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SLIC;

/**
 * Javascript implementation of an image segmentation algorithm of
 *
 *    SLIC Superpixels
 *    Radhakrishna Achanta, Appu Shaji, Kevin Smith, Aurelien Lucchi, Pascal
 *    Fua, and Sabine Süsstrunk
 *    IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 34,
 *    num. 11, p. 2274 - 2282, May 2012.
 *
 * and based on the VLFeat implementation.
 *
 * API
 * ---
 *
 *    SLIC(imageURL, options)
 *
 * The function takes the following options.
 * * `regionSize` - Parameter of superpixel size
 * * `minRegionSize` - Minimum segment size in pixels.
 *
 * Copyright 2014  LongLong Yu.
 */
function createImageData(width, height) {
  var context = document.createElement("canvas").getContext("2d");
  return context.createImageData(width, height);
}

function SLIC(imageData, options) {
  if (!(imageData instanceof ImageData)) throw "Invalid ImageData";
  this.imageData = imageData;
  this.imageData.data.set(imageData.data);
  options = options || {};
  this.regionSize = options.regionSize || 16;
  this.minRegionSize = options.minRegionSize || this.regionSize;
  this.maxIterations = options.maxIterations || 10;

  this._compute();
}

SLIC.prototype.finer = function () {
  var newSize = Math.max(5, Math.round(this.regionSize / Math.sqrt(2.0)));

  if (newSize !== this.regionSize) {
    this.regionSize = newSize;
    this.minRegionSize = Math.round(newSize * 0.8);

    this._compute();
  }
};

SLIC.prototype.coarser = function () {
  var newSize = Math.min(640, Math.round(this.regionSize * Math.sqrt(2.0)));

  if (newSize !== this.regionSize) {
    this.regionSize = newSize;
    this.minRegionSize = Math.round(newSize * 0.8);

    this._compute();
  }
};

SLIC.prototype._compute = function () {
  this.result = computeSLICSegmentation(this.imageData, this.regionSize, this.minRegionSize, this.maxIterations);
}; // Convert RGBA into XYZ color space. rgba: Red Green Blue Alpha.


function rgb2xyz(rgba, w, h) {
  var xyz = new Float32Array(3 * w * h),
      gamma = 2.2;

  for (var i = 0; i < w * h; i++) {
    // 1.0 / 255.9 = 0.00392156862.
    var r = rgba[4 * i + 0] * 0.00392156862,
        g = rgba[4 * i + 1] * 0.00392156862,
        b = rgba[4 * i + 2] * 0.00392156862;
    r = Math.pow(r, gamma);
    g = Math.pow(g, gamma);
    b = Math.pow(b, gamma);
    xyz[i] = r * 0.4887180 + g * 0.310680 + b * 0.2006020;
    xyz[i + w * h] = r * 0.1762040 + g * 0.812985 + b * 0.0108109;
    xyz[i + 2 * w * h] = g * 0.0102048 + b * 0.989795;
  }

  return xyz;
} // Convert XYZ to Lab.


function xyz2lab(xyz, w, h) {
  function f(x) {
    if (x > 0.00856) return Math.pow(x, 0.33333333);else return 7.78706891568 * x + 0.1379310336;
  }

  var xw = 1.0 / 3.0,
      yw = 1.0 / 3.0,
      Yw = 1.0,
      Xw = xw / yw,
      Zw = (1 - xw - yw) / (yw * Yw),
      ix = 1.0 / Xw,
      iy = 1.0 / Yw,
      iz = 1.0 / Zw,
      labData = new Float32Array(3 * w * h);

  for (var i = 0; i < w * h; i++) {
    var fx = f(xyz[i] * ix),
        fy = f(xyz[w * h + i] * iy),
        fz = f(xyz[2 * w * h + i] * iz);
    labData[i] = 116.0 * fy - 16.0;
    labData[i + w * h] = 500.0 * (fx - fy);
    labData[i + 2 * w * h] = 200.0 * (fy - fz);
  }

  return labData;
} // Compute gradient of 3 channel color space image.


function computeEdge(image, edgeMap, w, h) {
  for (var k = 0; k < 3; k++) {
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var a = image[k * w * h + y * w + x - 1],
            b = image[k * w * h + y * w + x + 1],
            c = image[k * w * h + (y + 1) * w + x],
            d = image[k * w * h + (y - 1) * w + x];
        edgeMap[y * w + x] += Math.pow(a - b, 2) + Math.pow(c - d, 2);
      }
    }
  }
} // Initialize superpixel clusters.


function initializeKmeansCenters(image, edgeMap, centers, clusterParams, numRegionsX, numRegionsY, regionSize, imW, imH) {
  var i = 0,
      j = 0,
      x,
      y;

  for (var v = 0; v < numRegionsY; v++) {
    for (var u = 0; u < numRegionsX; u++) {
      var centerx = 0,
          centery = 0,
          minEdgeValue = Infinity,
          xp,
          yp;
      x = parseInt(Math.round(regionSize * (u + 0.5)), 10);
      y = parseInt(Math.round(regionSize * (v + 0.5)), 10);
      x = Math.max(Math.min(x, imW - 1), 0);
      y = Math.max(Math.min(y, imH - 1), 0); // Search in a 3x3 neighbourhood the smallest edge response.

      for (yp = Math.max(0, y - 1); yp <= Math.min(imH - 1, y + 1); ++yp) {
        for (xp = Math.max(0, x - 1); xp <= Math.min(imW - 1, x + 1); ++xp) {
          var thisEdgeValue = edgeMap[yp * imW + xp];

          if (thisEdgeValue < minEdgeValue) {
            minEdgeValue = thisEdgeValue;
            centerx = xp;
            centery = yp;
          }
        }
      } // Initialize the new center at this location.


      centers[i++] = parseFloat(centerx);
      centers[i++] = parseFloat(centery); // 3 channels.

      centers[i++] = image[centery * imW + centerx];
      centers[i++] = image[imW * imH + centery * imW + centerx];
      centers[i++] = image[2 * imW * imH + centery * imW + centerx]; // THIS IS THE VARIABLE VALUE OF M, just start with 5.

      clusterParams[j++] = 10 * 10;
      clusterParams[j++] = regionSize * regionSize;
    }
  }
} // Re-compute clusters.


function computeCenters(image, segmentation, masses, centers, numRegions, imW, imH) {
  var region;

  for (var y = 0; y < imH; y++) {
    for (var x = 0; x < imW; x++) {
      region = segmentation[x + y * imW];
      masses[region]++;
      centers[region * 5 + 0] += x;
      centers[region * 5 + 1] += y;
      centers[region * 5 + 2] += image[y * imW + x];
      centers[region * 5 + 3] += image[imW * imH + y * imW + x];
      centers[region * 5 + 4] += image[2 * imW * imH + y * imW + x];
    }
  }

  for (region = 0; region < numRegions; region++) {
    var iMass = 1.0 / Math.max(masses[region], 1e-8);
    centers[region * 5] = centers[region * 5] * iMass;
    centers[region * 5 + 1] = centers[region * 5 + 1] * iMass;
    centers[region * 5 + 2] = centers[region * 5 + 2] * iMass;
    centers[region * 5 + 3] = centers[region * 5 + 3] * iMass;
    centers[region * 5 + 4] = centers[region * 5 + 4] * iMass;
  }
} // Remove small superpixels and assign them the nearest superpixel label.


function eliminateSmallRegions(segmentation, minRegionSize, numPixels, imW, imH) {
  var cleaned = new Int32Array(numPixels),
      segment = new Int32Array(numPixels),
      dx = new Array(1, -1, 0, 0),
      dy = new Array(0, 0, 1, -1),
      segmentSize,
      label,
      cleanedLabel,
      numExpanded,
      pixel,
      x,
      y,
      xp,
      yp,
      neighbor,
      direction;

  for (pixel = 0; pixel < numPixels; ++pixel) {
    if (cleaned[pixel]) continue;
    label = segmentation[pixel];
    numExpanded = 0;
    segmentSize = 0;
    segment[segmentSize++] = pixel;
    /** Find cleanedLabel as the label of an already cleaned region neighbor
     * of this pixel.
     */

    cleanedLabel = label + 1;
    cleaned[pixel] = label + 1;
    x = pixel % imW;
    y = Math.floor(pixel / imW);

    for (direction = 0; direction < 4; direction++) {
      xp = x + dx[direction];
      yp = y + dy[direction];
      neighbor = xp + yp * imW;
      if (0 <= xp && xp < imW && 0 <= yp && yp < imH && cleaned[neighbor]) cleanedLabel = cleaned[neighbor];
    } // Expand the segment.


    while (numExpanded < segmentSize) {
      var open = segment[numExpanded++];
      x = open % imW;
      y = Math.floor(open / imW);

      for (direction = 0; direction < 4; ++direction) {
        xp = x + dx[direction];
        yp = y + dy[direction];
        neighbor = xp + yp * imW;

        if (0 <= xp && xp < imW && 0 <= yp && yp < imH && cleaned[neighbor] === 0 && segmentation[neighbor] === label) {
          cleaned[neighbor] = label + 1;
          segment[segmentSize++] = neighbor;
        }
      }
    } // Change label to cleanedLabel if the semgent is too small.


    if (segmentSize < minRegionSize) {
      while (segmentSize > 0) {
        cleaned[segment[--segmentSize]] = cleanedLabel;
      }
    }
  } // Restore base 0 indexing of the regions.


  for (pixel = 0; pixel < numPixels; ++pixel) {
    --cleaned[pixel];
  }

  for (var i = 0; i < numPixels; ++i) {
    segmentation[i] = cleaned[i];
  }
} // Update cluster parameters.


function updateClusterParams(segmentation, mcMap, msMap, clusterParams) {
  var mc = new Float32Array(clusterParams.length / 2),
      ms = new Float32Array(clusterParams.length / 2);

  for (var i = 0; i < segmentation.length; i++) {
    var region = segmentation[i];

    if (mc[region] < mcMap[region]) {
      mc[region] = mcMap[region];
      clusterParams[region * 2 + 0] = mcMap[region];
    }

    if (ms[region] < msMap[region]) {
      ms[region] = msMap[region];
      clusterParams[region * 2 + 1] = msMap[region];
    }
  }
} // Assign superpixel label.


function assignSuperpixelLabel(im, segmentation, mcMap, msMap, distanceMap, centers, clusterParams, numRegionsX, numRegionsY, regionSize, imW, imH) {
  var x, y;

  for (var i = 0; i < distanceMap.length; ++i) {
    distanceMap[i] = Infinity;
  }

  var S = regionSize;

  for (var region = 0; region < numRegionsX * numRegionsY; ++region) {
    var cx = Math.round(centers[region * 5 + 0]),
        cy = Math.round(centers[region * 5 + 1]);

    for (y = Math.max(0, cy - S); y < Math.min(imH, cy + S); ++y) {
      for (x = Math.max(0, cx - S); x < Math.min(imW, cx + S); ++x) {
        var spatial = (x - cx) * (x - cx) + (y - cy) * (y - cy),
            dR = im[y * imW + x] - centers[5 * region + 2],
            dG = im[imW * imH + y * imW + x] - centers[5 * region + 3],
            dB = im[2 * imW * imH + y * imW + x] - centers[5 * region + 4],
            appearance = dR * dR + dG * dG + dB * dB,
            distance = Math.sqrt(appearance / clusterParams[region * 2 + 0] + spatial / clusterParams[region * 2 + 1]);

        if (distance < distanceMap[y * imW + x]) {
          distanceMap[y * imW + x] = distance;
          segmentation[y * imW + x] = region;
        }
      }
    }
  } // Update the max distance of color and space.


  for (y = 0; y < imH; ++y) {
    for (x = 0; x < imW; ++x) {
      if (clusterParams[segmentation[y * imW + x] * 2] < mcMap[y * imW + x]) clusterParams[segmentation[y * imW + x] * 2] = mcMap[y * imW + x];
      if (clusterParams[segmentation[y * imW + x] * 2 + 1] < msMap[y * imW + x]) clusterParams[segmentation[y * imW + x] * 2 + 1] = msMap[y * imW + x];
    }
  }
} // ...


function computeResidualError(prevCenters, currentCenters) {
  var error = 0.0;

  for (var i = 0; i < prevCenters.length; ++i) {
    var d = prevCenters[i] - currentCenters[i];
    error += Math.sqrt(d * d);
  }

  return error;
} // Remap label indices.


function remapLabels(segmentation) {
  var map = {},
      index = 0;

  for (var i = 0; i < segmentation.length; ++i) {
    var label = segmentation[i];
    if (map[label] === undefined) map[label] = index++;
    segmentation[i] = map[label];
  }

  return index;
} // Encode labels in RGB.


function encodeLabels(segmentation, data) {
  for (var i = 0; i < segmentation.length; ++i) {
    var value = Math.floor(segmentation[i]);
    data[4 * i + 0] = value & 255;
    data[4 * i + 1] = value >>> 8 & 255;
    data[4 * i + 2] = value >>> 16 & 255;
    data[4 * i + 3] = 255;
  }
} // Compute SLIC Segmentation.


function computeSLICSegmentation(imageData, regionSize, minRegionSize, maxIterations) {
  var i,
      imWidth = imageData.width,
      imHeight = imageData.height,
      numRegionsX = Math.floor(imWidth / regionSize),
      numRegionsY = Math.floor(imHeight / regionSize),
      numRegions = Math.floor(numRegionsX * numRegionsY),
      numPixels = Math.floor(imWidth * imHeight),
      edgeMap = new Float32Array(numPixels),
      masses = new Array(numPixels),
      // 2 (geometric: x & y) and 3 (RGB or Lab)
  currentCenters = new Float32Array((2 + 3) * numRegions),
      newCenters = new Float32Array((2 + 3) * numRegions),
      clusterParams = new Float32Array(2 * numRegions),
      mcMap = new Float32Array(numPixels),
      msMap = new Float32Array(numPixels),
      distanceMap = new Float32Array(numPixels),
      xyzData = rgb2xyz(imageData.data, imWidth, imHeight),
      labData = xyz2lab(xyzData, imWidth, imHeight); // Compute edge.

  computeEdge(labData, edgeMap, imWidth, imHeight); // Initialize K-Means Centers.

  initializeKmeansCenters(labData, edgeMap, currentCenters, clusterParams, numRegionsX, numRegionsY, regionSize, imWidth, imHeight);
  var segmentation = new Int32Array(numPixels);
  /** SLICO implementation: "SLIC Superpixels Compared to State-of-the-art
   * Superpixel Methods"
   */

  for (var iter = 0; iter < maxIterations; ++iter) {
    // Do assignment.
    assignSuperpixelLabel(labData, segmentation, mcMap, msMap, distanceMap, currentCenters, clusterParams, numRegionsX, numRegionsY, regionSize, imWidth, imHeight); // Update maximum spatial and color distances [1].

    updateClusterParams(segmentation, mcMap, msMap, clusterParams); // Compute new centers.

    for (i = 0; i < masses.length; ++i) {
      masses[i] = 0;
    }

    for (i = 0; i < newCenters.length; ++i) {
      newCenters[i] = 0;
    }

    computeCenters(labData, segmentation, masses, newCenters, numRegions, imWidth, imHeight); // Compute residual error of assignment.

    var error = computeResidualError(currentCenters, newCenters);
    if (error < 1e-5) break;

    for (i = 0; i < currentCenters.length; ++i) {
      currentCenters[i] = newCenters[i];
    }
  }

  eliminateSmallRegions(segmentation, minRegionSize, numPixels, imWidth, imHeight); // Refresh the canvas.

  var result = createImageData(imWidth, imHeight);
  result.numSegments = remapLabels(segmentation);
  encodeLabels(segmentation, result.data);
  return result;
}

function computeEdgemap(options) {
  if (typeof options === "undefined") options = {};
  var data = this.imageData.data,
      width = this.imageData.width,
      height = this.imageData.height,
      edgeMap = new Uint8Array(this.imageData.data),
      foreground = options.foreground || [255, 255, 255],
      background = options.background || [0, 0, 0],
      i,
      j,
      k;

  for (i = 0; i < height; ++i) {
    for (j = 0; j < width; ++j) {
      var offset = 4 * (i * width + j),
          index = data[4 * (i * width + j)],
          isBoundary = i === 0 || j === 0 || i === height - 1 || j === width - 1 || index !== data[4 * (i * width + j - 1)] || index !== data[4 * (i * width + j + 1)] || index !== data[4 * ((i - 1) * width + j)] || index !== data[4 * ((i + 1) * width + j)];

      if (isBoundary) {
        for (k = 0; k < foreground.length; ++k) {
          edgeMap[offset + k] = foreground[k];
        }
      } else {
        for (k = 0; k < background.length; ++k) {
          edgeMap[offset + k] = background[k];
        }
      }
    }
  }

  data.set(edgeMap);
  return this;
}

;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__scrim___3brSS {\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.25);\n  display: flex;\n  justify-content: space-around;\n  align-items: center; }\n\n.styles__puppetEditor___V4di8 {\n  display: flex;\n  flex-direction: column;\n  flex-wrap: wrap;\n  background-color: white;\n  padding-left: 40px;\n  padding-right: 40px;\n  border-radius: 4px; }\n  @media (max-width: 620px) {\n    .styles__puppetEditor___V4di8 {\n      width: 100%;\n      height: 100%; } }\n\n.styles__editorControlRow___avcJD {\n  height: 90px;\n  display: flex;\n  flex-direction: row;\n  align-items: center; }\n\n.styles__rowSpaceAround___1Yrmb {\n  width: 100%;\n  justify-content: space-around; }\n\n.styles__editorControlDisable___1eQ0h {\n  display: none;\n  pointer-events: none; }\n\n.styles__editorControlLabel___2ieCH {\n  font-size: 40px;\n  padding-right: 10px; }\n\n.styles__editorCanvas___18fS0 {\n  border: 1px solid black; }\n\n.styles__editorCanvasChecker___3GRU3 {\n  border: 1px solid black;\n  background-color: #FFF;\n  background-size: 40px 40px;\n  background-position: 0 0, 20px 20px;\n  background-image: linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC), linear-gradient(45deg, #CCC 25%, transparent 25%, transparent 75%, #CCC 75%, #CCC); }\n\n.styles__editorControls___2O4Xh {\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  padding: 20px; }\n\n.styles__editorNav___1VSuf {\n  margin: 10px 0;\n  font-size: 20px;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between; }\n\n.styles__navButton___EfAnt {\n  height: 20px;\n  min-width: 80px; }\n\n.styles__save___16VH- {\n  display: flex;\n  flex-direction: row;\n  justify-content: flex-end; }\n\n.styles__drawEraseLabel___1EAco {\n  min-width: 50px;\n  margin-top: 10px; }\n", ""]);

// exports
exports.locals = {
	"scrim": "styles__scrim___3brSS",
	"puppetEditor": "styles__puppetEditor___V4di8",
	"editorControlRow": "styles__editorControlRow___avcJD",
	"rowSpaceAround": "styles__rowSpaceAround___1Yrmb",
	"editorControlDisable": "styles__editorControlDisable___1eQ0h",
	"editorControlLabel": "styles__editorControlLabel___2ieCH",
	"editorCanvas": "styles__editorCanvas___18fS0",
	"editorCanvasChecker": "styles__editorCanvasChecker___3GRU3",
	"editorControls": "styles__editorControls___2O4Xh",
	"editorNav": "styles__editorNav___1VSuf",
	"navButton": "styles__navButton___EfAnt",
	"save": "styles__save___16VH-",
	"drawEraseLabel": "styles__drawEraseLabel___1EAco"
};

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _ControlPointService = _interopRequireDefault(__webpack_require__(150));

var _styles = _interopRequireDefault(__webpack_require__(39));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ControlPointEditor =
/*#__PURE__*/
function (_Component) {
  _inherits(ControlPointEditor, _Component);

  function ControlPointEditor() {
    var _ref;

    var _temp, _this;

    _classCallCheck(this, ControlPointEditor);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, (_ref = ControlPointEditor.__proto__ || Object.getPrototypeOf(ControlPointEditor)).call.apply(_ref, [this].concat(args))), _this.onSave = function () {
      return _this.props.onSave(_this.controlPointService.getControlPoints());
    }, _temp));
  }

  _createClass(ControlPointEditor, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.controlPointService = new _ControlPointService.default();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.canvasElement.width = 400;
      this.canvasElement.height = 300;
      this.controlPointService.init(this.canvasElement, this.props.imageSrc, this.props.backgroundRemovalData, this.props.controlPointPositions); // passive touch event listeners seem to be needed, which react does not support

      this.canvasElement.addEventListener('touchmove', function (event) {
        return _this2.controlPointService.onTouchMove(event);
      }, {
        passive: false
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return _react.default.createElement("div", null, _react.default.createElement("div", {
        className: _styles.default.editorNav
      }, _react.default.createElement(_button.default, {
        onClick: this.props.onClose,
        className: _styles.default.navButton
      }, "Back"), _react.default.createElement(_button.default, {
        onClick: this.onSave,
        className: _styles.default.navButton
      }, "Done")), _react.default.createElement("div", null, _react.default.createElement("canvas", {
        className: _styles.default.editorCanvasChecker,
        ref: function ref(input) {
          return _this3.canvasElement = input;
        },
        onMouseMove: this.controlPointService.onMouseMove,
        onMouseDown: this.controlPointService.onMouseDown,
        onContextMenu: this.controlPointService.onContextMenu,
        onMouseUp: this.controlPointService.onMouseUp,
        onMouseOut: this.controlPointService.onMouseOut,
        onMouseOver: this.controlPointService.onMouseOver,
        onTouchStart: this.controlPointService.onTouchStart,
        onTouchEnd: this.controlPointService.onTouchEnd,
        onDoubleClick: this.controlPointService.onDoubleClick
      })), _react.default.createElement("div", {
        className: _styles.default.editorControlParam
      }, _react.default.createElement("div", {
        className: _styles.default.editorControlRow
      }, _react.default.createElement("div", {
        className: _styles.default.editorControlLabel
      }, _react.default.createElement("p", null, "2")), _react.default.createElement("p", null, "Control Points"))));
    }
  }]);

  return ControlPointEditor;
}(_react.Component);

ControlPointEditor.propTypes = {
  onClose: _propTypes.default.func.isRequired,
  onSave: _propTypes.default.func.isRequired,
  imageSrc: _propTypes.default.string.isRequired,
  backgroundRemovalData: _propTypes.default.object.isRequired,
  controlPointPositions: _propTypes.default.array
};
var _default = ControlPointEditor;
exports.default = _default;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ImageUtil = __webpack_require__(24);

var _imageLoader = _interopRequireDefault(__webpack_require__(18));

var _panHandler = _interopRequireDefault(__webpack_require__(38));

var _math = __webpack_require__(40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

var MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE'
};

var ControlPointService = function ControlPointService() {
  var _this = this;

  var that = this;
  var context;
  var width;
  var height;
  var mouse = {};
  var mouseAbs = {};
  var foregroundImage;
  var controlPoints = [];
  var controlPointIndices = [];
  var activeControlPointIndex = -1;
  var zoom = 1;
  var lastTouchTime = 0;
  var panHandler = new _panHandler.default();
  var mouseState = MOUSE_STATE.UP;
  /*****************************
      API
  *****************************/

  this.init = function (canvas, imageData, backgroundRemovalData, controlPointPositions) {
    width = canvas.width;
    height = canvas.height;
    context = canvas.getContext('2d');
    controlPoints = controlPointPositions || [];
    context.fillStyle = '#0099EE';
    (0, _imageLoader.default)(imageData).then(function (img) {
      var largerSize = Math.max(img.width, img.height);
      var normWidth = img.width / largerSize * 400;
      var normHeight = img.height / largerSize * 400;
      width = normWidth;
      height = normHeight;
      var originalImageData = (0, _ImageUtil.getImageDataFromImage)(img, width, height);
      return (0, _ImageUtil.extractForeground)(originalImageData, backgroundRemovalData);
    }).then(function (imageNoBG) {
      foregroundImage = imageNoBG;
      redraw();
    });
  };

  this.onMouseMove = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    var rect = event.target.getBoundingClientRect();
    mouseAbs.x = (event.clientX - rect.left) / zoom;
    mouseAbs.y = (event.clientY - rect.top) / zoom;
    mouse.x = mouseAbs.x - panHandler.getPanPosition().x;
    mouse.y = mouseAbs.y - panHandler.getPanPosition().y;
    mouse.x = Math.round(mouse.x);
    mouse.y = Math.round(mouse.y);

    if (!controlPoints.length) {
      return;
    } // Hover state control point logic


    if (mouseState === MOUSE_STATE.UP) {
      var nearestControlPoint = controlPoints.map(function (cp, index) {
        return {
          index: index,
          distance: (0, _math.getDistance)(mouse.x, mouse.y, cp[0], cp[1])
        };
      }).filter(function (cp) {
        return cp.distance < 10;
      }).sort(function (a, b) {
        return a.distance - b.distance;
      })[0];

      if (nearestControlPoint !== undefined) {
        activeControlPointIndex = nearestControlPoint.index;
      } else {
        activeControlPointIndex = -1;
      }
    } // Dragging control point logic


    if (mouseState === MOUSE_STATE.DOWN && controlPoints[activeControlPointIndex]) {
      var cp = controlPoints[activeControlPointIndex];
      cp[0] = mouse.x;
      cp[1] = mouse.y;
    }

    redraw();
  };

  this.onMouseDown = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    mouseState = MOUSE_STATE.DOWN;

    if (activeControlPointIndex >= 0) {
      return;
    }

    controlPoints.push([mouse.x, mouse.y]);
    activeControlPointIndex = controlPoints.length - 1;
    redraw();
  };

  this.onContextMenu = function (event) {
    event.preventDefault();
    return false;
  };

  this.onMouseUp = function (event, isTouch) {
    if (!isTouch) {
      event.preventDefault();
    }

    ;
    mouseState = MOUSE_STATE.UP;
  };

  this.onMouseOut = function (event) {
    event.preventDefault();
    mouseState = MOUSE_STATE.OUTSIDE;
  };

  this.onMouseOver = function (event) {
    event.preventDefault();

    if (mouseState !== MOUSE_STATE.DOWN) {
      mouseState = MOUSE_STATE.UP;
    }
  };

  this.onTouchStart = function (event) {
    event.preventDefault();

    if (event.touches.length > 1) {
      return;
    }

    var now = performance.now();
    var lastTouchDelta = now - lastTouchTime;
    lastTouchTime = now;

    if (lastTouchDelta < 200) {
      _this.onDoubleClick();

      return;
    }

    _this.onMouseMove(event.touches[0], true); // build highlight data by forcing a "mouse hover"


    _this.onMouseDown(event.touches[0], true);
  };

  this.onTouchMove = function (event) {
    event.preventDefault();

    _this.onMouseMove(event.touches[0], true);
  };

  this.onTouchEnd = function (event) {
    event.preventDefault();

    if (event.touches.length) {
      return;
    }

    _this.onMouseUp(event);
  };

  this.onDoubleClick = function (event) {
    if (activeControlPointIndex < 0) {
      return;
    }

    controlPoints.splice(activeControlPointIndex, 1);
    activeControlPointIndex = -1;
    redraw();
  };

  this.getControlPoints = function () {
    return controlPoints;
  };

  this.setMouseState = function (state) {
    return mouseState = state;
  };
  /*****************************
      Private stuff
  *****************************/


  var redraw = function redraw() {
    context.clearRect(0, 0, width, height);
    context.drawImage(foregroundImage, 0, 0, width, height, 0, 0, width, height);

    if (!controlPoints || !controlPoints.length) {
      return;
    }

    controlPoints.forEach(function (cp, index) {
      var _cp = _slicedToArray(cp, 2),
          x = _cp[0],
          y = _cp[1];

      var radius = index === activeControlPointIndex ? 10 : 5;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    });
  };
};

var _default = ControlPointService;
exports.default = _default;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _three = __webpack_require__(8);

var _util = __webpack_require__(69);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE'
};

var DranimateMouseHandler =
/*#__PURE__*/
function () {
  function DranimateMouseHandler(rendererElement, panHandler) {
    _classCallCheck(this, DranimateMouseHandler);

    this.rendererElement = rendererElement;
    this.panHandler = panHandler;
    this.mouseState = MOUSE_STATE.UP;
    this.mouseRelative = {
      x: 0,
      y: 0
    };
    this.mouseAbsolute = {
      x: 0,
      y: 0
    };
    this.selectedPuppet;
    this.activeControlPoint = {
      hoveredOver: false,
      valid: false
    };
  }

  _createClass(DranimateMouseHandler, [{
    key: "updateMousePosition",
    value: function updateMousePosition(x, y, zoom) {
      var boundingRect = this.rendererElement.getBoundingClientRect();
      this.mouseAbsolute = {
        x: x - boundingRect.left,
        y: y - boundingRect.top
      }; // TODO: set window width and height on resize

      this.mouseRelative = {
        x: (x - boundingRect.left - window.innerWidth / 2) / zoom - this.panHandler.getPanPosition().x,
        y: (y - boundingRect.top - window.innerHeight / 2) / zoom - this.panHandler.getPanPosition().y
      };
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown(event, puppets, zoom) {
      var _this = this;

      this.updateMousePosition(event.clientX, event.clientY, zoom);
      this.mouseState = MOUSE_STATE.DOWN;

      if (this.panHandler.getPanEnabled()) {
        this.panHandler.onMouseDown(this.mouseAbsolute.x, this.mouseAbsolute.y, zoom);
        return;
      }

      if (this.activeControlPoint.hoveredOver) {
        this.selectedPuppet = puppets[this.activeControlPoint.puppetIndex];
        this.activeControlPoint.beingDragged = true;
        puppets.forEach(function (puppet) {
          return puppet.setSelectionGUIVisible(puppet === _this.selectedPuppet);
        });
        return;
      } // the notion of a selected puppet is only relative to mouse / touch, not leap motion


      this.selectedPuppet = puppets.find(function (puppet) {
        return puppet.pointInsideMesh(_this.mouseRelative.x, _this.mouseRelative.y);
      });

      if (this.selectedPuppet) {
        this.selectedPuppet.setSelectionState(true, this.mouseRelative.x, this.mouseRelative.y);
      }

      puppets.forEach(function (puppet) {
        return puppet.setSelectionGUIVisible(puppet === _this.selectedPuppet);
      });
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(event, puppets, zoom) {
      this.updateMousePosition(event.clientX, event.clientY, zoom);
      /* Find control point closest to the mouse */

      if (this.panHandler.getPanEnabled() && this.mouseState === MOUSE_STATE.DOWN) {
        this.panHandler.onMouseMove(this.mouseAbsolute.x, this.mouseAbsolute.y, zoom);
        return;
      }

      if (this.activeControlPoint.beingDragged) {
        // control point is being dragged by mouse
        var puppet = puppets[this.activeControlPoint.puppetIndex];
        var ci = this.activeControlPoint.controlPointIndex;
        var puppetCenter = puppet.getCenter();
        var mouseVector = new _three.Vector2(this.mouseRelative.x, this.mouseRelative.y).sub(puppetCenter).multiplyScalar(1 / puppet.getScale()).add(puppetCenter);
        puppet.setControlPointPosition(ci, mouseVector);
        return;
      }

      if (this.selectedPuppet && this.selectedPuppet.selectionState.isBeingDragged) {
        var _mouseVector = new _three.Vector2(this.mouseRelative.x, this.mouseRelative.y);

        this.selectedPuppet.incrementPosition(_mouseVector.x, _mouseVector.y);
        return;
      }

      var activeCp = (0, _util.getPuppetAndControlPointFromPostion)(puppets, this.mouseRelative.x, this.mouseRelative.y, 10, zoom);

      if (activeCp) {
        this.activeControlPoint = activeCp;
        this.rendererElement.parentNode.style.cursor = 'pointer';
      } else {
        this.rendererElement.parentNode.style.cursor = 'default';
        this.activeControlPoint.hoveredOver = false;
      }
    }
  }, {
    key: "onMouseUp",
    value: function onMouseUp(event, puppets, zoom) {
      this.updateMousePosition(event.clientX, event.clientY, zoom);
      this.mouseState = MOUSE_STATE.UP;

      if (this.panHandler.getPanEnabled()) {
        return;
      }

      this.activeControlPoint.beingDragged = false;

      if (this.selectedPuppet) {
        this.selectedPuppet.setSelectionState(false);
      }
    }
  }, {
    key: "getSelectedPuppet",
    value: function getSelectedPuppet() {
      return this.selectedPuppet;
    }
  }, {
    key: "onRemovePuppet",
    value: function onRemovePuppet() {
      this.selectedPuppet = null;
    }
  }]);

  return DranimateMouseHandler;
}();

exports.default = DranimateMouseHandler;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Leap = _interopRequireWildcard(__webpack_require__(25));

var _three = __webpack_require__(8);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function transformLeapCoordinate(vector) {
  return {
    x: vector[0] * 1.5,
    y: -(vector[1] - 200) * 1.5
  };
}

var DranimateLeapHandler =
/*#__PURE__*/
function () {
  function DranimateLeapHandler(rendererElement, panHandler, puppets) {
    _classCallCheck(this, DranimateLeapHandler);

    this.rendererElement = rendererElement;
    this.panHandler = panHandler;
    this.puppets = puppets;
    this.controllerIsConnected = false;
    this.leapController = new Leap.Controller({
      frameEventName: 'deviceFrame'
    }).connect();
    this.lastFrameId;
  }

  _createClass(DranimateLeapHandler, [{
    key: "update",
    value: function update(selectedPuppet) {
      if (!selectedPuppet) {
        return;
      }

      var leapFrame = this.leapController.frame();

      if (!leapFrame.valid || !leapFrame.hands.length) {
        return;
      }

      var hand = leapFrame.hands[0];
      var thumb = transformLeapCoordinate(hand.fingers[0].distal.center());
      var pointer = transformLeapCoordinate(hand.fingers[1].distal.center());
      var middle = transformLeapCoordinate(hand.fingers[2].distal.center());
      var ring = transformLeapCoordinate(hand.fingers[3].distal.center());
      var pinky = transformLeapCoordinate(hand.fingers[4].distal.center());
      this.normalizeControlPoints(selectedPuppet, [{
        cpi: 0,
        position: new _three.Vector2(thumb.x, thumb.y)
      }, {
        cpi: 1,
        position: new _three.Vector2(pointer.x, pointer.y)
      }, {
        cpi: 2,
        position: new _three.Vector2(middle.x, middle.y)
      }, {
        cpi: 3,
        position: new _three.Vector2(ring.x, ring.y)
      }, {
        cpi: 4,
        position: new _three.Vector2(pinky.x, pinky.y)
      }]);
    }
  }, {
    key: "normalizeControlPoints",
    value: function normalizeControlPoints(puppet, frames) {
      var puppetCenter = puppet.getCenter();
      var normalizedFrames = frames.map(function (frame) {
        var position = frame.position.sub(puppetCenter).multiplyScalar(1 / puppet.getScale()).add(puppetCenter);
        return {
          cpi: frame.cpi,
          position: position
        };
      });
      puppet.setControlPointPositions(normalizedFrames);
    }
  }]);

  return DranimateLeapHandler;
}();

exports.default = DranimateLeapHandler;

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _three = __webpack_require__(8);

var _util = __webpack_require__(69);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function getFirstTouchLocation(event, rendererElement) {
  var firstTouch = event.touches[0];
  var boundingRect = rendererElement.getBoundingClientRect();
  return {
    x: firstTouch.clientX - boundingRect.left,
    y: firstTouch.clientY - boundingRect.top
  };
}

function getRelativeTouchPosition(x, y, rendererElement, panHandler, zoom) {
  var boundingRect = rendererElement.getBoundingClientRect();
  return {
    x: (x - boundingRect.left - window.innerWidth / 2) / zoom - panHandler.getPanPosition().x,
    y: (y - boundingRect.top - window.innerHeight / 2) / zoom - panHandler.getPanPosition().y
  };
}

var DranimateTouchHandler =
/*#__PURE__*/
function () {
  function DranimateTouchHandler(rendererElement, panHandler) {
    _classCallCheck(this, DranimateTouchHandler);

    this.rendererElement = rendererElement;
    this.panHandler = panHandler;
    this.touchMap = new Map();
    this.selectedPuppet;
  }

  _createClass(DranimateTouchHandler, [{
    key: "onTouchStart",
    value: function onTouchStart(event, puppets, zoom) {
      var _this = this;

      if (this.panHandler.getPanEnabled()) {
        var firstTouchLocation = getFirstTouchLocation(event, this.rendererElement);
        this.panHandler.onMouseDown(firstTouchLocation.x, firstTouchLocation.y, zoom);
        return;
      } // IF A NEW TOUCH POINT IS WITHIN DISTANCE FROM PUPPET CONTROL POINT, ASSOCIATE THE TWO IN TOUCHMAP


      var touch = event.changedTouches[0];
      var relativePosition = getRelativeTouchPosition(touch.clientX, touch.clientY, this.rendererElement, this.panHandler, zoom);
      var controlPoint = (0, _util.getPuppetAndControlPointFromPostion)(puppets, relativePosition.x, relativePosition.y, 10, zoom);

      if (controlPoint) {
        this.touchMap.set(touch.identifier, controlPoint);
        return;
      } // IF A SINGLE FINGER TOUCHES A PUPPET BUT NOT A CONTROL POINT, SELECT THE PUPPET


      if (event.touches.length > 1) {
        return;
      }

      this.selectedPuppet = puppets.find(function (puppet) {
        return puppet.pointInsideMesh(relativePosition.x, relativePosition.y);
      });

      if (this.selectedPuppet) {
        this.selectedPuppet.setSelectionState(true, relativePosition.x, relativePosition.y);
      }

      puppets.forEach(function (puppet) {
        return puppet.setSelectionGUIVisible(puppet === _this.selectedPuppet);
      });
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(event, puppets, zoom) {
      var _this2 = this;

      event.preventDefault(); // PAN CAMERA

      if (this.panHandler.getPanEnabled()) {
        var firstTouchLocation = getFirstTouchLocation(event, this.rendererElement);
        this.panHandler.onMouseMove(firstTouchLocation.x, firstTouchLocation.y, zoom);
        return;
      }

      var normalizedTouchPoints = Object.values(event.touches).filter(function (touch) {
        return _this2.touchMap.has(touch.identifier);
      }).map(function (touch) {
        var controlPoint = _this2.touchMap.get(touch.identifier);

        var puppet = puppets[controlPoint.puppetIndex];
        var puppetCenter = puppet.getCenter();
        var relativePosition = getRelativeTouchPosition(touch.clientX, touch.clientY, _this2.rendererElement, _this2.panHandler, zoom);
        var position = new _three.Vector2(relativePosition.x, relativePosition.y).sub(puppetCenter).multiplyScalar(1 / puppet.getScale()).add(puppetCenter);
        return {
          cpi: controlPoint.controlPointIndex,
          position: position
        };
      }); // EDIT CONTROL POINTS

      if (normalizedTouchPoints.length) {
        this.selectedPuppet.setControlPointPositions(normalizedTouchPoints);
        return;
      } // MOVE PUPPET XY


      if (this.selectedPuppet) {
        var firstTouch = event.touches[0];
        var relativePosition = getRelativeTouchPosition(firstTouch.clientX, firstTouch.clientY, this.rendererElement, this.panHandler, zoom);
        this.selectedPuppet.incrementPosition(relativePosition.x, relativePosition.y);
        return;
      }
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(event, puppets, zoom) {
      var _this3 = this;

      var currentTouchIds = Object.values(event.touches).map(function (touch) {
        return touch.identifier;
      }); // IF A REMOVED TOUCH POINT WAS ASSOCIATED WITH A CONTROL POINT, REMOVE IT FROM TOUCHMAP

      _toConsumableArray(this.touchMap.keys()).filter(function (touchId) {
        return !currentTouchIds.includes(touchId);
      }).forEach(function (touchId) {
        return _this3.touchMap.delete(touchId);
      });
    }
  }, {
    key: "getSelectedPuppet",
    value: function getSelectedPuppet() {
      return this.selectedPuppet;
    }
  }, {
    key: "onRemovePuppet",
    value: function onRemovePuppet() {
      this.selectedPuppet = null;
    }
  }]);

  return DranimateTouchHandler;
}();

exports.default = DranimateTouchHandler;

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gif = _interopRequireDefault(__webpack_require__(44));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var GifRecorder =
/*#__PURE__*/
function () {
  function GifRecorder() {
    _classCallCheck(this, GifRecorder);

    this.recordingFrequency = 150;
    this.recorder = new _gif.default({
      workers: 2,
      quality: 30,
      workerScript: 'workers/gif.worker.js'
    });
    this.lastRecordedFrame = 0;
  }

  _createClass(GifRecorder, [{
    key: "stop",
    value: function stop(canvasElement) {
      var _this = this;

      var elapsedTime = performance.now() - this.lastRecordedFrame;
      this.recorder.addFrame(canvasElement, {
        delay: elapsedTime,
        copy: true
      });
      return new Promise(function (resolve, reject) {
        try {
          _this.recorder.on('finished', function (blob) {
            var objectUrl = URL.createObjectURL(blob);
            resolve(objectUrl);
          });

          _this.recorder.render();
        } catch (error) {
          reject(error);
        }
      });
    }
  }, {
    key: "offerFrame",
    value: function offerFrame(canvasElement) {
      var now = performance.now(); // record first frame

      if (!this.lastRecordedFrame) {
        this.lastRecordedFrame = now;
        this.recorder.addFrame(canvasElement, {
          copy: true
        });
        return;
      } // record subsequent frames


      var elapsedTime = now - this.lastRecordedFrame;

      if (elapsedTime >= this.recordingFrequency) {
        this.lastRecordedFrame = now;
        this.recorder.addFrame(canvasElement, {
          delay: elapsedTime,
          copy: true
        });
      }
    }
  }]);

  return GifRecorder;
}();

exports.default = GifRecorder;

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateMesh = generateMesh;

var _delaunayFast = _interopRequireDefault(__webpack_require__(42));

var _ImageUtil = __webpack_require__(24);

var _canvasUtils = _interopRequireDefault(__webpack_require__(156));

var _PuppetFactory = _interopRequireDefault(__webpack_require__(71));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findEdgesOfImage(imageNoBackgroundData) {
  var width = imageNoBackgroundData.width;
  var height = imageNoBackgroundData.height;
  var data = imageNoBackgroundData.data;
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var contourData = context.createImageData(imageNoBackgroundData.width, imageNoBackgroundData.height);

  for (var i = 0; i < height; ++i) {
    for (var j = 0; j < width; ++j) {
      var offset = 4 * (i * width + j);
      var alpha = data[4 * (i * width + j) + 3];
      var isSLICBoundary = alpha !== data[4 * (i * width + j - 1)] || alpha !== data[4 * (i * width + j + 1)] || alpha !== data[4 * ((i - 1) * width + j)] || alpha !== data[4 * ((i + 1) * width + j)];
      var isOnImageBorder = i === 0 || j === 0 || i === height - 1 || j === width - 1;
      var isBoundary = isSLICBoundary && !isOnImageBorder;
      var p = 4 * (i * width + j);

      if (isBoundary) {
        contourData.data[p] = 255;
        contourData.data[p + 1] = 0;
        contourData.data[p + 2] = 0;
        contourData.data[p + 3] = 255;
      } else {
        contourData.data[p] = 255;
        contourData.data[p + 1] = 0;
        contourData.data[p + 2] = 0;
        contourData.data[p + 3] = 0;
      }
    }
  }

  return contourData;
}

function recalculateContourPoints(contourData) {
  var contourPointsRaw = [];
  /* Convert contour image into list of points */

  for (var x = 0; x < contourData.width; ++x) {
    for (var y = 0; y < contourData.height; ++y) {
      if (_canvasUtils.default.getColorAtXY(x, y, 'a', contourData) === 255) {
        contourPointsRaw.push([x, y]);
      }
    }
  }
  /* Resample list of points */


  var resampleDist = 10;

  for (var i = 0; i < contourPointsRaw.length; i++) {
    var a = contourPointsRaw[i];

    for (var j = 0; j < contourPointsRaw.length; j++) {
      if (i != j) {
        var b = contourPointsRaw[j];
        var ax = a[0];
        var ay = a[1];
        var bx = b[0];
        var by = b[1];
        var dx = Math.abs(bx - ax);
        var dy = Math.abs(by - ay);

        if (Math.sqrt(dx * dx + dy * dy) < resampleDist) {
          contourPointsRaw.splice(j, 1);
          j--;
        }
      }
    }
  }

  return contourPointsRaw;
}

function generatePuppetGeometry(contourPoints, controlPoints, imageNoBackgroundData) {
  /* Create list of vertices from contour points */
  var vertices = contourPoints.map(function (contourPoint) {
    return contourPoint;
  });
  /* Add vertices for requested control points as well */

  var controlPointIndices = [];
  controlPoints.forEach(function (controlPoint) {
    controlPointIndices.push(vertices.length);
    vertices.push(controlPoint);
  });
  /* Run delaunay on vertices to generate mesh */

  var rawTriangles = _delaunayFast.default.triangulate(vertices);
  /* Remove trianges whose centroids are in the image background */


  var triangles = [];

  for (var i = 0; i < rawTriangles.length; i += 3) {
    var x1 = vertices[rawTriangles[i]][0];
    var y1 = vertices[rawTriangles[i]][1];
    var x2 = vertices[rawTriangles[i + 1]][0];
    var y2 = vertices[rawTriangles[i + 1]][1];
    var x3 = vertices[rawTriangles[i + 2]][0];
    var y3 = vertices[rawTriangles[i + 2]][1];
    var centroidX = Math.round((x1 + x2 + x3) / 3);
    var centroidY = Math.round((y1 + y2 + y3) / 3);

    if (_canvasUtils.default.getColorAtXY(centroidX, centroidY, 'a', imageNoBackgroundData) === 255) {
      triangles.push(rawTriangles[i]);
      triangles.push(rawTriangles[i + 1]);
      triangles.push(rawTriangles[i + 2]);
    }
  }
  /* Remove vertices that aren't part of any triangle */


  for (var vi = 0; vi < vertices.length; vi++) {
    var vertexIsPartOfATriangle = false;

    for (var ti = 0; ti < triangles.length; ti++) {
      if (vi === triangles[ti]) {
        vertexIsPartOfATriangle = true;
      }
    }

    if (!vertexIsPartOfATriangle) {
      vertices.splice(vi, 1);
      /* Since we removed a vertex from the verts array, we need to update the
       * control points and triangles because they point to the vertices by index. */

      for (var _ti = 0; _ti < triangles.length; _ti++) {
        if (triangles[_ti] > vi) {
          triangles[_ti] -= 1;
        }
      }

      for (var cpi = 0; cpi < controlPointIndices.length; cpi++) {
        if (controlPointIndices[cpi] > vi) {
          controlPointIndices[cpi] -= 1;
        }
      }
    }
  }

  return {
    triangles: triangles,
    vertices: vertices,
    controlPointIndices: controlPointIndices
  };
}

function generateMesh(puppetId, image, imageNoBackgroundData, originalImageData, controlPoints) {
  var contourData = findEdgesOfImage(imageNoBackgroundData);
  return (0, _ImageUtil.extractForeground)(originalImageData, imageNoBackgroundData).then(function (imageNoBG) {
    var contourPoints = recalculateContourPoints(contourData);
    var geometry = generatePuppetGeometry(contourPoints, controlPoints, imageNoBackgroundData);
    return Promise.resolve({
      id: puppetId,
      image: image,
      vertices: geometry.vertices,
      faces: geometry.triangles,
      controlPoints: geometry.controlPointIndices,
      controlPointPositions: controlPoints,
      imageNoBG: imageNoBG,
      backgroundRemovalData: imageNoBackgroundData
    });
  }).then(function (puppetParams) {
    return (0, _PuppetFactory.default)(puppetParams);
  });
}

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* Some utility functions for html5 canvas images. -zrispo */
function getValueIndex(x, y, value, imageData) {
  var index = CanvasUtils.getIndexOfXY(x, y, imageData);
  var valueIndex = null;

  if (value === 'r') {
    valueIndex = index;
  } else if (value === 'g') {
    valueIndex = index + 1;
  } else if (value === 'b') {
    valueIndex = index + 2;
  } else if (value === 'a') {
    valueIndex = index + 3;
  }

  return valueIndex;
}

var CanvasUtils =
/*#__PURE__*/
function () {
  function CanvasUtils() {
    _classCallCheck(this, CanvasUtils);
  }

  _createClass(CanvasUtils, null, [{
    key: "getIndexOfXY",
    value: function getIndexOfXY(x, y, imageData) {
      return 4 * (y * imageData.width + x);
    } // TODO: move get value index out

  }, {
    key: "getColorAtXY",
    value: function getColorAtXY(x, y, value, imageData) {
      var valueIndex = getValueIndex(x, y, value, imageData);

      if (valueIndex === null) {
        console.log('Invalid value param for getColorAtXY! (r,g,b,or a expected!!)');
        return null;
      }

      return imageData.data[valueIndex];
    }
  }, {
    key: "setColorAtXY",
    value: function setColorAtXY(x, y, value, imageData, newValue) {
      var valueIndex = getValueIndex(x, y, value, imageData);

      if (valueIndex === null) {
        console.log('Invalid value param for getColorAtXY! (r,g,b,or a expected!!)');
        return;
      }

      imageData.data[valueIndex] = newValue;
    }
  }]);

  return CanvasUtils;
}();

exports.default = CanvasUtils;

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _three = __webpack_require__(8);

var _arap = _interopRequireDefault(__webpack_require__(158));

var _puppetRecording = __webpack_require__(159);

var _math = __webpack_require__(40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Puppet = function Puppet(puppetData) {
  // INITIAL VALUES
  this.current = {
    position: new _three.Vector2(0, 0),
    center: puppetData.halfSize.clone(),
    rotation: 0,
    scale: 1
  };
  this.previous = {
    position: this.current.position.clone(),
    scale: this.current.scale,
    rotation: this.current.rotation
  };
  this.selectionState = {
    isBeingDragged: false,
    lastPosition: new _three.Vector2(0, 0)
  };
  this.name = 'DEFAULT_PUPPET_NAME'; // RECORDING

  this.puppetRecording = new _puppetRecording.PuppetRecording(); // GRAPHICS

  this.image = puppetData.image;
  this.id = puppetData.id;
  this.imageNoBG = puppetData.imageNoBG;
  this.controlPointPositions = puppetData.controlPointPositions; // are these just unedited control points?

  this.backgroundRemovalData = puppetData.backgroundRemovalData;
  this.wireframeMaterial = this.wireframeMaterial;
  this.texturedMaterial = puppetData.texturedMaterial;
  this.verts = puppetData.verts;
  this.faces = puppetData.faces;
  this.controlPoints = puppetData.controlPoints;
  this.vertsFlatArray = puppetData.vertsFlatArray;
  this.facesFlatArray = puppetData.facesFlatArray;
  this.threeMesh = puppetData.threeMesh;
  this.boundingBox = puppetData.boundingBox;
  this.controlPointSpheres = puppetData.controlPointSpheres;
  this.group = puppetData.group;
  this.centerSphere = puppetData.centerSphere;
  this.undeformedVertices = this.verts;
  this.needsUpdate = true; // SETUP NEW ARAP MESH

  console.log('----Puppet.generateMesh from ', this.vertsFlatArray.length / 2);
  this.arapMeshID = _arap.default.createNewARAPMesh(this.vertsFlatArray, this.facesFlatArray);
  /* Add control points */

  for (var i = 0; i < this.controlPoints.length; i++) {
    _arap.default.addControlPoint(this.arapMeshID, this.controlPoints[i]);
  }

  for (var i = 0; i < this.controlPoints.length; i++) {
    var cpi = this.controlPoints[i];

    _arap.default.setControlPointPosition(this.arapMeshID, cpi, this.verts[cpi][0], this.verts[cpi][1]);
  }
};

Puppet.prototype.incrementPosition = function (x, y) {
  var position = new _three.Vector2(x, y);
  var delta = position.clone().sub(this.selectionState.lastPosition).multiplyScalar(1 / this.getScale());
  this.current.center.add(position.clone().sub(this.selectionState.lastPosition));
  this.current.position.add(delta);
  this.selectionState.lastPosition = position;
};

Puppet.prototype.setScale = function (scale) {
  this.current.scale = scale;
};

Puppet.prototype.getScale = function () {
  return this.current.scale;
};

Puppet.prototype.setRotation = function (rotation) {
  this.current.rotation = rotation;
};

Puppet.prototype.getRotation = function () {
  return this.current.rotation;
};

Puppet.prototype.setRenderWireframe = function (shouldRender) {
  this.threeMesh.material = shouldRender ? this.wireframeMaterial : this.texturedMaterial;
};

Puppet.prototype.setSelectionState = function (isBeingDragged, x, y) {
  this.selectionState.isBeingDragged = isBeingDragged;

  if (isBeingDragged) {
    this.selectionState.lastPosition.x = x;
    this.selectionState.lastPosition.y = y;
  }
};

Puppet.prototype.startRecording = function () {
  this.puppetRecording = new _puppetRecording.PuppetRecording(performance.now());
};

Puppet.prototype.stopRecording = function () {
  this.puppetRecording.stop(performance.now());
}; // Set one to many control points (leap motion, touch)


Puppet.prototype.setControlPointPositions = function (controlPoints) {
  var _this = this;

  this.needsUpdate = true;
  controlPoints.forEach(function (controlPoint) {
    _arap.default.setControlPointPosition(_this.arapMeshID, _this.controlPoints[controlPoint.cpi], controlPoint.position.x, controlPoint.position.y);
  });

  if (this.puppetRecording.isRecording) {
    var puppetCenter = this.getCenter();
    var normalizedControlPoints = controlPoints.map(function (controlPoint) {
      var position = controlPoint.position.clone().rotateAround(puppetCenter, -_this.getRotation()).sub(puppetCenter);
      return {
        cpi: controlPoint.cpi,
        position: position
      };
    });
    this.puppetRecording.setFrame(normalizedControlPoints, performance.now());
  }
}; // Set a single control point (mouse interaction)


Puppet.prototype.setControlPointPosition = function (controlPointIndex, position) {
  this.needsUpdate = true;

  _arap.default.setControlPointPosition(this.arapMeshID, this.controlPoints[controlPointIndex], position.x, position.y);

  if (this.puppetRecording.isRecording) {
    var puppetCenter = this.getCenter();
    var point = position.rotateAround(puppetCenter, -this.getRotation()).sub(puppetCenter);
    var frame = [{
      cpi: controlPointIndex,
      position: point
    }];
    this.puppetRecording.setFrame(frame, performance.now());
  }
};

Puppet.prototype.update = function (elapsedTime) {
  var _this2 = this;

  var dx = this.current.position.x - this.previous.position.x;
  var dy = this.current.position.y - this.previous.position.y;
  var shouldMoveXY = dx !== 0 || dy !== 0;
  var shouldScale = this.previous.scale !== this.current.scale;
  var shouldRotate = this.previous.rotation !== this.current.rotation;
  this.previous.position.x = this.current.position.x;
  this.previous.position.y = this.current.position.y; // SCALE PUPPET

  if (shouldScale) {
    this.previous.scale = this.current.scale;
    this.needsUpdate = true;
  } // ROTATE PUPPET


  if (shouldRotate) {
    var deltaRotation = this.current.rotation - this.previous.rotation;
    this.previous.rotation = this.current.rotation;
    var puppetCenter = this.getCenter();
    this.controlPoints.forEach(function (controlPoint, index) {
      var _this2$threeMesh$geom = _this2.threeMesh.geometry.vertices[controlPoint],
          x = _this2$threeMesh$geom.x,
          y = _this2$threeMesh$geom.y;
      var point = new _three.Vector2(x, y).sub(puppetCenter).multiplyScalar(1 / _this2.getScale()).add(puppetCenter).rotateAround(puppetCenter, deltaRotation);

      _this2.setControlPointPosition(index, point);
    });
  } // TRANSLATE PUPPET


  if (shouldMoveXY) {
    var _puppetCenter = this.getCenter();

    var xyDelta = new _three.Vector2(dx, dy);
    this.controlPoints.forEach(function (controlPoint, index) {
      var position = _this2.threeMesh.geometry.vertices[controlPoint].clone();

      var vertexPosition = new _three.Vector2(position.x, position.y);
      var point = vertexPosition.sub(_puppetCenter).multiplyScalar(1 / _this2.getScale()).add(_puppetCenter).add(xyDelta);

      _this2.setControlPointPosition(index, point);
    });
  }

  var recordedFrame = this.puppetRecording.update(performance.now());

  if (recordedFrame) {
    var _puppetCenter2 = this.getCenter();

    var absoluteControlPoints = recordedFrame.controlPoints.map(function (controlPoint) {
      var point = controlPoint.position.clone().add(_puppetCenter2).rotateAround(_puppetCenter2, _this2.getRotation());
      return {
        cpi: controlPoint.cpi,
        position: point
      };
    });
    this.setControlPointPositions(absoluteControlPoints);
  } // DEFORM PUPPET WITH ARAP


  if (this.needsUpdate) {
    // console.log('update');
    // UPDATE ARAP DEFORMER
    _arap.default.updateMeshDeformation(this.arapMeshID);

    var deformedVerts = _arap.default.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);

    var _puppetCenter3 = this.getCenter();

    for (var i = 0; i < deformedVerts.length; i += 2) {
      var vertex = this.threeMesh.geometry.vertices[i / 2];
      var point = new _three.Vector2(deformedVerts[i], deformedVerts[i + 1]).sub(_puppetCenter3).multiplyScalar(this.getScale()).add(_puppetCenter3);
      vertex.x = point.x;
      vertex.y = point.y;
    } // UPDATE CONTROL POINT GRAPHICS


    this.controlPoints.forEach(function (controlPoint, index) {
      var vertex = _this2.threeMesh.geometry.vertices[controlPoint];
      var controlPointSphere = _this2.controlPointSpheres[index];
      controlPointSphere.position.x = vertex.x;
      controlPointSphere.position.y = vertex.y;
    }); // FOR TESTING THE CENTER OF THE PUPPET:
    // this.centerSphere.position.x = this.current.center.x;
    // this.centerSphere.position.y = this.current.center.y;
    // UPDATE MISC THREEJS

    this.threeMesh.geometry.dynamic = true;
    this.threeMesh.geometry.verticesNeedUpdate = true;
    this.boundingBox.update();
    this.boundingBox.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)

    this.needsUpdate = false;
  }
};

Puppet.prototype.getCenter = function () {
  return this.current.center.clone();
};

Puppet.prototype.cleanup = function () {
  console.error("Warning: Puppet.cleanup() not yet implemented! You are wasting memory! >:(");
};

Puppet.prototype.setSelectionGUIVisible = function (visible) {
  this.boundingBox.visible = visible;
  this.controlPointSpheres.forEach(function (sphere) {
    return sphere.visible = visible;
  });
};

Puppet.prototype.pointInsideMesh = function (xUntransformed, yUntransformed) {
  var point = new _three.Vector2(xUntransformed, yUntransformed);
  var allFaces = this.threeMesh.geometry.faces;
  var allVerts = this.threeMesh.geometry.vertices;

  for (var i = 0; i < allFaces.length; i++) {
    var v1 = allVerts[allFaces[i].a];
    var v2 = allVerts[allFaces[i].b];
    var v3 = allVerts[allFaces[i].c];

    if ((0, _math.pointIsInsideTriangle)(point.x, point.y, v1, v2, v3)) {
      return true;
    }
  }

  return false;
};

var _default = Puppet;
exports.default = _default;

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*  ARAP.js  *
 * zrispo.co */

/* this library only uses flat arrays that represent vertices and triangles
 * for simplicity, it's recommended to use arap-three.js which wraps this
 * code and handles all that nasty stuff for you. */
var ARAP = function () {
  var arap = {
    REVISION: "dev"
  };
  /* Wrapper functions for the emscripten module */

  var createNewMeshWrapper = Module.cwrap('createNewMesh', '[number]', ['number']);
  var setMeshVertexDataWrapper = Module.cwrap('setMeshVertexData', 'number', ['number', 'number', 'number']);
  var setMeshTriangleDataWrapper = Module.cwrap('setMeshTriangleData', 'number', ['number', 'number', 'number']);
  var setupMeshDeformerWrapper = Module.cwrap('setupMeshDeformer', 'number', ['number']);
  var addControlPointWrapper = Module.cwrap('addControlPoint', 'number', ['number', 'number']);
  var setControlPointPositionWrapper = Module.cwrap('setControlPointPosition', '[number]', ['number', 'number', 'number', 'number']);
  var updateMeshDeformationWrapper = Module.cwrap('updateMeshDeformation', '[number]', ['number']);
  var getMeshVertexDataWrapper = Module.cwrap('getMeshVertexData', 'number', ['number', 'number', 'number']);
  /* Small helper function that handles all the nasty memory stuff for arrays */

  var doArrayFunction = function doArrayFunction(arr, func, optionalArg) {
    // Create data
    var data = new Float32Array(arr); // Get data byte size, allocate memory on Emscripten heap, and get pointer

    var nDataBytes = data.length * data.BYTES_PER_ELEMENT;

    var dataPtr = Module._malloc(nDataBytes); // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)


    var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer)); // Call function and get result

    func(optionalArg, dataHeap.byteOffset, data.length);
    var result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, data.length); // Free memory

    Module._free(dataPtr); //return result.slice(); // use slice() to make a copy of result


    return result;
  };
  /* Exposed functions */

  /* Creates a new mesh inside the module and returns the index of the mesh
   * in the module's internal array. */


  arap.createNewARAPMesh = function (verts, tris) {
    // make new mesh
    var meshIndex = createNewMeshWrapper(); // add vertices

    doArrayFunction(verts, setMeshVertexDataWrapper, meshIndex); // add faces

    doArrayFunction(tris, setMeshTriangleDataWrapper, meshIndex); // setup mesh deformer

    setupMeshDeformerWrapper(meshIndex);
    console.log("new mesh created with ID " + meshIndex);
    return meshIndex;
  };
  /*  */


  arap.addControlPoint = function (meshIndex, vertIndex) {
    addControlPointWrapper(meshIndex, vertIndex);
  };
  /*  */


  arap.setControlPointPosition = function (meshIndex, vertIndex, x, y) {
    setControlPointPositionWrapper(meshIndex, vertIndex, x, y);
  };
  /* Call this after adding and setting the positions of control points.
   * This is where all the work for mesh deformation is done.
   * Note that the first time you call updateMeshDeformation after adding
   * or removing control points, deform2d must recompute a bunch of
   * stuff which is very slow. */


  arap.updateMeshDeformation = function (meshIndex) {
    updateMeshDeformationWrapper(meshIndex);
  };
  /* Call this after calling update() to get your vertices deformed by the
   * control points. */

  /* ~Possible optimization: return all verts in one big array to avoid memory
   * stuff overhead*/


  arap.getDeformedVertices = function (meshIndex, size) {
    var empty = [];

    for (var i = 0; i < size; i++) {
      empty.push(0);
    }
    /* use optionalArg for meshIndex (this is gross - should make a better way) */
    //var deformedVerts = doArrayFunction(empty, getMeshVertexDataWrapper, meshIndex);


    var numBytes = empty.length * Float32Array.BYTES_PER_ELEMENT;

    var ptr = Module._malloc(numBytes);

    getMeshVertexDataWrapper(meshIndex, ptr, empty.length);
    var deformedVerts = [];

    for (var i = 0; i < empty.length; i++) {
      var v = HEAPF32[ptr / Float32Array.BYTES_PER_ELEMENT + i];
      deformedVerts.push(v);
    }

    return deformedVerts;
  };

  return arap;
}();

var _default = ARAP;
exports.default = _default;

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PuppetRecording = void 0;

var _three = __webpack_require__(8);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TIME_DELTA = 0.001;

var PuppetRecording =
/*#__PURE__*/
function () {
  function PuppetRecording(timestamp) {
    _classCallCheck(this, PuppetRecording);

    var now = timestamp !== undefined ? timestamp : performance.now();
    this.hasRecording = false;
    this.isRecording = true;
    this.controlPointFrames = [];
    this.relativePoints = [];
    this.startTime = now;
    this.stopTime = now;
    this.duration = 0;
    this.activeIndex = -1; // this.allIndices = new Set();

    this.id = Math.random();
    this.lastServedIndex;
  }

  _createClass(PuppetRecording, [{
    key: "stop",
    value: function stop(timestamp) {
      var _this = this;

      this.stopTime = timestamp;
      this.duration = this.stopTime - this.startTime;
      this.hasRecording = true;
      this.isRecording = false; // attach relative times to each frames

      this.controlPointFrames.forEach(function (frame) {
        var relativeTime = (frame.timestamp - _this.startTime) / _this.duration;
        frame.relativeTime = relativeTime;
      });
      this.relativePoints = this.controlPointFrames.map(function (frame, index) {
        return {
          index: index,
          relativeTime: frame.relativeTime
        };
      });
    }
  }, {
    key: "setFrame",
    value: function setFrame(controlPoints, timestamp) {
      this.controlPointFrames.push({
        controlPoints: controlPoints,
        timestamp: timestamp
      });
    }
  }, {
    key: "update",
    value: function update(timestamp) {
      if (!timestamp || timestamp <= this.stopTime) {
        throw new Error('Update must take place after recording has stopped');
      }

      if (!this.hasRecording) {
        return;
      }

      var timeSinceStop = timestamp - this.stopTime;
      var relativeTimeInLoop = timeSinceStop / this.duration % 1;

      var closestIndex = this._getNearestIndexForRelativePoint(relativeTimeInLoop);

      if (this.lastServedIndex !== closestIndex) {
        this.lastServedIndex = closestIndex;
        return this.controlPointFrames[closestIndex];
      }
    } // Binary search for nearset relativePoint

  }, {
    key: "_getNearestIndexForRelativePoint",
    value: function _getNearestIndexForRelativePoint(relativeTimeInLoop) {
      var low = 0;
      var high = this.relativePoints.length - 1;

      while (low < high) {
        var mid = Math.floor((low + high) / 2);
        var d1 = Math.abs(this.relativePoints[mid].relativeTime - relativeTimeInLoop);
        var d2 = Math.abs(this.relativePoints[mid + 1].relativeTime - relativeTimeInLoop);

        if (d2 <= d1) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      return this.relativePoints[high].index;
    }
  }]);

  return PuppetRecording;
}();

exports.PuppetRecording = PuppetRecording;

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _button = _interopRequireDefault(__webpack_require__(12));

var _fab = _interopRequireDefault(__webpack_require__(161));

var _topbar = _interopRequireDefault(__webpack_require__(164));

var _paramControl = _interopRequireDefault(__webpack_require__(167));

var _recorder = _interopRequireDefault(__webpack_require__(171));

var _zoomPanner = _interopRequireDefault(__webpack_require__(68));

var _puppetEditor = _interopRequireDefault(__webpack_require__(66));

var _profile = _interopRequireDefault(__webpack_require__(174));

var _file = __webpack_require__(180);

var _PuppetEditorStateService = _interopRequireDefault(__webpack_require__(70));

var _dranimate = _interopRequireDefault(__webpack_require__(41));

var _styles = _interopRequireDefault(__webpack_require__(182));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Stage =
/*#__PURE__*/
function (_Component) {
  _inherits(Stage, _Component);

  function Stage() {
    var _this;

    _classCallCheck(this, Stage);

    _this = _possibleConstructorReturn(this, (Stage.__proto__ || Object.getPrototypeOf(Stage)).call(this));

    _this.componentDidMount = function () {
      // passive touch event listeners seem to be needed, which react does not support
      _this.dranimateStageContainer.addEventListener('touchmove', function (event) {
        return _dranimate.default.onTouchMove(event);
      }, {
        passive: false
      });

      _dranimate.default.setup(_this.dranimateStageContainer);
    };

    _this.onMouseDown = function (event) {
      _dranimate.default.onMouseDown(event);

      var selectedPuppet = _dranimate.default.getSelectedPuppet();

      _this.setState({
        selectedPuppet: selectedPuppet
      });
    };

    _this.closeEditor = function () {
      return _this.setState({
        editorIsOpen: false
      });
    };

    _this.closeProfile = function () {
      return _this.setState({
        profileIsOpen: false
      });
    };

    _this.openController = function (controllerIsOpen) {
      return _this.setState({
        controllerIsOpen: controllerIsOpen
      });
    };

    _this.onFabClick = function () {
      return _this.filePicker.click();
    };

    _this.onZoomSelect = function (isZoomIn) {
      return isZoomIn ? _dranimate.default.zoomIn() : _dranimate.default.zoomOut();
    };

    _this.onPanSelect = function (isPanSelected) {
      return _dranimate.default.setPanEnabled(isPanSelected);
    };

    _this.onDeleteSelectedPuppet = function () {
      return _dranimate.default.deleteSelectedPuppet();
    };

    _this.onEditSelectedPuppet = function () {
      console.log('setItem?', _dranimate.default.getSelectedPuppet());

      _PuppetEditorStateService.default.setItem(_dranimate.default.getSelectedPuppet());

      _this.setState({
        editorIsOpen: true
      });
    };

    _this.onFileChange = function (event) {
      (0, _file.loadDranimateFile)(_this.filePicker).then(function (result) {
        var isPuppet = !!result.id;

        if (isPuppet) {
          _dranimate.default.addPuppet(result);
        } else {
          _PuppetEditorStateService.default.setItem(result);

          _this.setState({
            editorIsOpen: true
          });
        }
      }).catch(function (error) {
        return console.log('error', error);
      });
    };

    _this.onProfileClick = function () {
      return _this.setState({
        profileIsOpen: true
      });
    };

    _this.state = {
      editorIsOpen: false,
      profileIsOpen: false,
      controllerIsOpen: false,
      selectedPuppet: null
    };
    return _this;
  }

  _createClass(Stage, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return _react.default.createElement("div", {
        className: _styles.default.stage
      }, _react.default.createElement("div", {
        className: _styles.default.dranimateCanvas,
        onMouseDown: this.onMouseDown,
        onMouseMove: _dranimate.default.onMouseMove,
        onMouseUp: _dranimate.default.onMouseUp,
        onTouchStart: _dranimate.default.onTouchStart,
        onTouchEnd: _dranimate.default.onTouchEnd,
        ref: function ref(input) {
          return _this2.dranimateStageContainer = input;
        }
      }), _react.default.createElement(_topbar.default, {
        className: _styles.default.topBar
      }), _react.default.createElement(_button.default, {
        className: _styles.default.profileButton,
        onClick: this.onProfileClick
      }, "Profile"), _react.default.createElement(_paramControl.default, {
        className: _styles.default.paramControl,
        selectedPuppet: this.state.selectedPuppet,
        onEditSelectedPuppet: this.onEditSelectedPuppet,
        onDeleteSelectedPuppet: this.onDeleteSelectedPuppet
      }), _react.default.createElement("div", {
        className: _styles.default.lowerLeft
      }, _react.default.createElement(_zoomPanner.default, {
        onPanSelect: this.onPanSelect,
        onZoomSelect: this.onZoomSelect
      }), _react.default.createElement(_recorder.default, null)), _react.default.createElement(_fab.default, {
        className: _styles.default.fab,
        onClick: this.onFabClick
      }), _react.default.createElement("input", {
        type: "file",
        ref: function ref(input) {
          return _this2.filePicker = input;
        },
        onChange: this.onFileChange,
        className: _styles.default.hiddenFilePicker
      }), this.state.editorIsOpen ? _react.default.createElement(_puppetEditor.default, {
        onClose: this.closeEditor
      }) : null, this.state.profileIsOpen ? _react.default.createElement(_profile.default, {
        onClose: this.closeProfile
      }) : null);
    }
  }]);

  return Stage;
}(_react.Component);

var _default = Stage;
exports.default = _default;

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _styles = _interopRequireDefault(__webpack_require__(162));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Fab =
/*#__PURE__*/
function (_Component) {
  _inherits(Fab, _Component);

  function Fab(props) {
    _classCallCheck(this, Fab);

    return _possibleConstructorReturn(this, (Fab.__proto__ || Object.getPrototypeOf(Fab)).call(this, props));
  }

  _createClass(Fab, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: this.props.className
      }, _react.default.createElement("button", {
        onClick: this.props.onClick,
        className: _styles.default.fab
      }, _react.default.createElement("span", {
        className: _styles.default.fabBar
      }), _react.default.createElement("span", {
        className: _styles.default.fabBar
      })));
    }
  }]);

  return Fab;
}(_react.Component);

Fab.propTypes = {
  onClick: _propTypes.default.func.isRequired,
  className: _propTypes.default.string.isRequired
};
var _default = Fab;
exports.default = _default;

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(163);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__fab___2g7mP {\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  background-color: #EEE;\n  position: relative;\n  box-shadow: 2px 2px 4px #979797;\n  -webkit-box-shadow: 2px 2px 4px #979797;\n  transition: box-shadow 0.15s ease-out, transform 0.15s ease-out, -webkit-box-shadow 0.15s ease-out; }\n\n.styles__fab___2g7mP:hover {\n  transform: translate(0px, -2px);\n  box-shadow: 3px 4px 4px #979797;\n  -webkit-box-shadow: 3px 4px 4px #979797; }\n\n.styles__fabBar___2bt-R {\n  display: block;\n  position: absolute;\n  height: 4px;\n  width: 30px;\n  border-radius: 2px;\n  background-color: #FF3571;\n  left: 5px;\n  top: 18px; }\n\n.styles__fab___2g7mP :nth-child(1) {\n  transform: rotate(0deg); }\n\n.styles__fab___2g7mP :nth-child(2) {\n  transform: rotate(90deg); }\n", ""]);

// exports
exports.locals = {
	"fab": "styles__fab___2g7mP",
	"fabBar": "styles__fabBar___2bt-R"
};

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _styles = _interopRequireDefault(__webpack_require__(165));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopBar =
/*#__PURE__*/
function (_Component) {
  _inherits(TopBar, _Component);

  function TopBar() {
    var _ref;

    var _temp, _this;

    _classCallCheck(this, TopBar);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(_this, (_temp = _this = _possibleConstructorReturn(this, (_ref = TopBar.__proto__ || Object.getPrototypeOf(TopBar)).call.apply(_ref, [this].concat(args))), _this.onInfoClick = function () {
      return console.log('onInfoClick');
    }, _temp));
  }

  _createClass(TopBar, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: this.props.className
      }, _react.default.createElement("div", {
        className: _styles.default.topbar
      }, _react.default.createElement("div", {
        className: "".concat(_styles.default.topbarItem, " ").concat(_styles.default.aboutContainer)
      }, _react.default.createElement("p", {
        className: _styles.default.aboutLabel
      }, "Dranimate"), _react.default.createElement("p", {
        className: _styles.default.aboutInfo
      }, "About"))));
    }
  }]);

  return TopBar;
}(_react.Component);

var _default = TopBar;
exports.default = _default;

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(166);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__topbar___BnV0U {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: space-around;\n  align-items: center;\n  width: 100%; }\n\n.styles__topbarItem___1T_T5 {\n  padding: 10px; }\n\n.styles__aboutContainer___1dOhN {\n  cursor: pointer; }\n\n.styles__aboutContainer___1dOhN:hover .styles__aboutInfo___2JgLz {\n  display: inline-block; }\n\n.styles__aboutInfo___2JgLz {\n  display: none;\n  position: absolute;\n  border: 1px solid #000;\n  border-radius: 4px;\n  width: 160px; }\n", ""]);

// exports
exports.locals = {
	"topbar": "styles__topbar___BnV0U",
	"topbarItem": "styles__topbarItem___1T_T5",
	"aboutContainer": "styles__aboutContainer___1dOhN",
	"aboutInfo": "styles__aboutInfo___2JgLz"
};

/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _slider = _interopRequireDefault(__webpack_require__(37));

var _serializer = _interopRequireDefault(__webpack_require__(168));

var _styles = _interopRequireDefault(__webpack_require__(169));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParamControl =
/*#__PURE__*/
function (_Component) {
  _inherits(ParamControl, _Component);

  function ParamControl(props) {
    var _this;

    _classCallCheck(this, ParamControl);

    _this = _possibleConstructorReturn(this, (ParamControl.__proto__ || Object.getPrototypeOf(ParamControl)).call(this, props));

    _this.onSaveClick = function () {
      return (0, _serializer.default)(_this.props.selectedPuppet);
    };

    _this.onScaleChange = function (eventValue) {
      var value = parseInt(eventValue) / 100;

      _this.props.selectedPuppet.setScale(value);
    };

    _this.onRotateChange = function (eventValue) {
      var value = parseFloat(eventValue) / 100;

      _this.props.selectedPuppet.setRotation(value);
    };

    return _this;
  }

  _createClass(ParamControl, [{
    key: "renderPanel",
    value: function renderPanel() {
      return _react.default.createElement("div", {
        className: this.props.className
      }, _react.default.createElement("p", null, "Params:"), _react.default.createElement("p", null, "Scale"), _react.default.createElement(_slider.default, {
        min: 1,
        max: 300,
        defaultValue: 100,
        onChange: this.onScaleChange
      }), _react.default.createElement("p", null, "Rotate"), _react.default.createElement(_slider.default, {
        min: -628,
        max: 628,
        defaultValue: this.props.selectedPuppet.getRotation(),
        onChange: this.onRotateChange
      }), _react.default.createElement("p", {
        className: _styles.default.actionLabel
      }, "Actions:"), _react.default.createElement(_button.default, {
        className: _styles.default.actionButton,
        onClick: this.props.onEditSelectedPuppet
      }, "Edit puppet"), _react.default.createElement(_button.default, {
        className: _styles.default.actionButton,
        onClick: this.onSaveClick
      }, "Save puppet"), _react.default.createElement(_button.default, {
        className: _styles.default.actionButton,
        onClick: this.props.onDeleteSelectedPuppet
      }, "Delete puppet"));
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.selectedPuppet ? this.renderPanel() : null;
    }
  }]);

  return ParamControl;
}(_react.Component);

ParamControl.propTypes = {
  selectedPuppet: _propTypes.default.object,
  onDeleteSelectedPuppet: _propTypes.default.func.isRequired,
  onEditSelectedPuppet: _propTypes.default.func.isRequired
};
var _default = ParamControl;
exports.default = _default;

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fileSaver = _interopRequireDefault(__webpack_require__(43));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getImageAsDataURL(img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var context = canvas.getContext('2d');
  canvas.getContext('2d');
  context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
}

function getJsonFromPuppet(puppet) {
  var puppetData = {
    verts: puppet.verts,
    faces: puppet.faces,
    controlPoints: puppet.controlPoints,
    controlPointPositions: puppet.controlPointPositions,
    backgroundRemovalData: {
      data: _toConsumableArray(puppet.backgroundRemovalData.data),
      width: puppet.backgroundRemovalData.width,
      height: puppet.backgroundRemovalData.height
    },
    imageData: getImageAsDataURL(puppet.image),
    imageNoBGData: getImageAsDataURL(puppet.imageNoBG)
  };
  return JSON.stringify(puppetData);
}

function savePuppetToFile(puppet) {
  var puppetJsonString = getJsonFromPuppet(puppet);
  var blob = new Blob([puppetJsonString], {
    type: 'application/json'
  });

  _fileSaver.default.saveAs(blob, 'testpuppet.json');
}

var _default = savePuppetToFile;
exports.default = _default;

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(170);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__actionLabel___3xlX8 {\n  margin-top: 10px; }\n\n.styles__actionButton___3bPCb {\n  margin: 5px;\n  width: 100%;\n  height: 20px; }\n", ""]);

// exports
exports.locals = {
	"actionLabel": "styles__actionLabel___3xlX8",
	"actionButton": "styles__actionButton___3bPCb"
};

/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _dranimate = _interopRequireDefault(__webpack_require__(41));

var _styles = _interopRequireDefault(__webpack_require__(172));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var Recorder =
/*#__PURE__*/
function (_Component) {
  _inherits(Recorder, _Component);

  function Recorder(props) {
    var _this;

    _classCallCheck(this, Recorder);

    _this = _possibleConstructorReturn(this, (Recorder.__proto__ || Object.getPrototypeOf(Recorder)).call(this, props));

    _this.onGifRecordToggle = function () {
      var gifIsRecording = !_this.state.gifIsRecording;

      _this.setState({
        gifIsRecording: gifIsRecording
      });

      _dranimate.default.setGifIsRecording(gifIsRecording);
    };

    _this.onPuppetRecordToggle = function (event) {
      var puppetIsRecording = !_this.state.puppetIsRecording;

      _this.setState({
        puppetIsRecording: puppetIsRecording
      });

      _dranimate.default.setRecording(puppetIsRecording);
    };

    _this.handleKeyPress = function (event) {
      if (event.keyCode !== 32) {
        return;
      }

      _this.onPuppetRecordToggle();
    };

    _this.state = {
      puppetIsRecording: false,
      gifIsRecording: false
    };
    _this.keyListener = window.addEventListener('keydown', _this.handleKeyPress.bind(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(Recorder, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener(this.keyListener);
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: this.props.className
      }, _react.default.createElement(_button.default, {
        className: this.state.puppetIsRecording ? _styles.default.recorder : _styles.default.recorderActive,
        onClick: this.onPuppetRecordToggle
      }, this.state.isRecording ? 'Puppet Stop' : 'Puppet Start'), _react.default.createElement(_button.default, {
        className: this.state.gifIsRecording ? _styles.default.recorder : _styles.default.recorderActive,
        onClick: this.onGifRecordToggle
      }, this.state.isRecording ? 'GIF Stop' : 'GIF Start'));
    }
  }]);

  return Recorder;
}(_react.Component);

Recorder.propTypes = {};
var _default = Recorder;
exports.default = _default;

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(173);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__recorder___21JmV {\n  background-color: #FF3571;\n  color: #FFF;\n  min-width: 90px; }\n\n.styles__recorderActive___Xi0g1 {\n  background-color: #EEE;\n  color: #000;\n  min-width: 90px; }\n", ""]);

// exports
exports.locals = {
	"recorder": "styles__recorder___21JmV",
	"recorderActive": "styles__recorderActive___Xi0g1"
};

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _button = _interopRequireDefault(__webpack_require__(12));

var _materialInput = _interopRequireDefault(__webpack_require__(175));

var _styles = _interopRequireDefault(__webpack_require__(178));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Profile =
/*#__PURE__*/
function (_Component) {
  _inherits(Profile, _Component);

  function Profile(props) {
    var _this;

    _classCallCheck(this, Profile);

    _this = _possibleConstructorReturn(this, (Profile.__proto__ || Object.getPrototypeOf(Profile)).call(this, props));

    _this.onSignIn = function () {
      console.log("TODO: sign in with ".concat(_this.state.username, " / ").concat(_this.state.password));
    };

    _this.onUsernameChange = function (username) {
      return _this.setState({
        username: username
      });
    };

    _this.onPasswordChange = function (password) {
      return _this.setState({
        password: password
      });
    };

    _this.state = {
      username: '',
      password: ''
    };
    return _this;
  }

  _createClass(Profile, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: _styles.default.profileScrim
      }, _react.default.createElement("div", {
        className: _styles.default.profileContents
      }, _react.default.createElement(_materialInput.default, {
        type: "text",
        label: "Username",
        onChange: this.onUsernameChange,
        className: _styles.default.inputField
      }), _react.default.createElement(_materialInput.default, {
        type: "password",
        label: "Password",
        onChange: this.onPasswordChange,
        className: _styles.default.inputField
      }), _react.default.createElement(_button.default, {
        onClick: this.onSignIn,
        className: _styles.default.formButton
      }, "Sign In"), _react.default.createElement(_button.default, {
        onClick: this.props.onClose,
        className: _styles.default.formButton
      }, "Close")));
    }
  }]);

  return Profile;
}(_react.Component);

Profile.propTypes = {
  onClose: _propTypes.default.func.isRequired
};
var _default = Profile;
exports.default = _default;

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(0));

var _propTypes = _interopRequireDefault(__webpack_require__(1));

var _styles = _interopRequireDefault(__webpack_require__(176));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MaterialInput =
/*#__PURE__*/
function (_Component) {
  _inherits(MaterialInput, _Component);

  function MaterialInput(props) {
    var _this;

    _classCallCheck(this, MaterialInput);

    _this = _possibleConstructorReturn(this, (MaterialInput.__proto__ || Object.getPrototypeOf(MaterialInput)).call(this, props));

    _this.onChange = function (event) {
      return _this.props.onChange(event.target.value);
    };

    return _this;
  }

  _createClass(MaterialInput, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: "".concat(_styles.default.container, " ").concat(this.props.className)
      }, _react.default.createElement("input", {
        type: this.props.type || 'text',
        onChange: this.onChange,
        className: _styles.default.materialInput,
        required: true
      }), _react.default.createElement("span", {
        className: _styles.default.highlight
      }), _react.default.createElement("span", {
        className: _styles.default.bar
      }), _react.default.createElement("label", {
        className: _styles.default.label
      }, this.props.label));
    }
  }]);

  return MaterialInput;
}(_react.Component);

MaterialInput.propTypes = {
  label: _propTypes.default.string.isRequired,
  type: _propTypes.default.string,
  onChange: _propTypes.default.func.isRequired
};
var _default = MaterialInput;
exports.default = _default;

/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(177);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__container___2Ihfo {\n  height: 40px;\n  position: relative; }\n\n.styles__materialInput___DoXSH {\n  font-size: 1em;\n  display: block;\n  width: 100%;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #616161;\n  position: absolute;\n  bottom: 0;\n  color: #616161;\n  outline: none;\n  box-shadow: none; }\n  .styles__materialInput___DoXSH:focus {\n    outline: none; }\n\n.styles__label___3w9at {\n  color: #616161;\n  font-weight: normal;\n  position: absolute;\n  pointer-events: none;\n  top: 10px;\n  transition: 0.2s ease all; }\n\n/* active state */\n.styles__materialInput___DoXSH:focus ~ .styles__label___3w9at, .styles__materialInput___DoXSH:valid ~ .styles__label___3w9at {\n  top: 0px;\n  font-size: 0.8em; }\n\n.styles__bar___1MQqe {\n  position: absolute;\n  bottom: 0;\n  display: block;\n  width: 100%; }\n\n.styles__bar___1MQqe:before, .styles__bar___1MQqe:after {\n  content: '';\n  height: 2px;\n  width: 0;\n  bottom: 1px;\n  position: absolute;\n  background: #616161;\n  transition: 0.2s ease all; }\n\n.styles__bar___1MQqe:before {\n  left: 50%; }\n\n.styles__bar___1MQqe:after {\n  right: 50%; }\n\n/* active state */\n.styles__materialInput___DoXSH:focus ~ .styles__bar___1MQqe:before, .styles__materialInput___DoXSH:focus ~ .styles__bar___1MQqe:after {\n  width: 50%; }\n\n.styles__highlight___2dTLq {\n  position: absolute;\n  height: 60%;\n  width: 100px;\n  top: 25%;\n  left: 0;\n  pointer-events: none;\n  opacity: 0.5; }\n\n/* active state */\n.styles__materialInput___DoXSH:focus ~ .styles__highlight___2dTLq {\n  animation: styles__inputHighlighter___jlqPd 0.3s ease; }\n\n@keyframes styles__inputHighlighter___jlqPd {\n  from {\n    background: #5264AE; }\n  to {\n    width: 0;\n    background: transparent; } }\n", ""]);

// exports
exports.locals = {
	"container": "styles__container___2Ihfo",
	"materialInput": "styles__materialInput___DoXSH",
	"label": "styles__label___3w9at",
	"bar": "styles__bar___1MQqe",
	"highlight": "styles__highlight___2dTLq",
	"inputHighlighter": "styles__inputHighlighter___jlqPd"
};

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(179);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__profileScrim___2YKdP {\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  position: absolute;\n  background-color: rgba(0, 0, 0, 0.25);\n  display: flex;\n  justify-content: space-around;\n  align-items: center; }\n\n.styles__profileContents___G2mjc {\n  display: flex;\n  flex-direction: column;\n  flex-wrap: wrap;\n  background-color: #FFF;\n  padding: 20px 40px;\n  border-radius: 4px;\n  min-width: 300px; }\n  @media (max-width: 620px) {\n    .styles__profileContents___G2mjc {\n      min-width: none;\n      width: 100%;\n      height: 100%; } }\n\n.styles__inputField___1KKHx {\n  margin: 10px 0; }\n\n.styles__formButton___2raE_ {\n  margin: 10px 0;\n  height: 30px; }\n", ""]);

// exports
exports.locals = {
	"profileScrim": "styles__profileScrim___2YKdP",
	"profileContents": "styles__profileContents___G2mjc",
	"inputField": "styles__inputField___1KKHx",
	"formButton": "styles__formButton___2raE_"
};

/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFile = loadFile;
exports.loadDranimateFile = loadDranimateFile;

var _deserializer = _interopRequireDefault(__webpack_require__(181));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mimeTypeMap = {
  image: ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'],
  puppet: ['application/json']
};

function loadFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onloadend = function (event) {
      return resolve(reader.result);
    };

    reader.onerror = function (error) {
      return reject(error);
    };

    reader.readAsDataURL(file);
  });
}

function loadDranimateFile(element) {
  var file = element.files && element.files[0];

  if (!file) {
    return Promise.reject(error);
  }

  if (file.name.includes('.json')) {
    // TODO: why does mobile android not recognizing json mime type???
    return (0, _deserializer.default)(file);
  }

  var fileType = Object.keys(mimeTypeMap).find(function (key) {
    return mimeTypeMap[key].includes(file.type);
  });

  if (!fileType) {
    return Promise.reject('Unsupported file type');
  }

  if (fileType === 'image') {
    return loadFile(file);
  }

  return (0, _deserializer.default)(file);
}

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _PuppetFactory = _interopRequireDefault(__webpack_require__(71));

var _imageLoader = _interopRequireDefault(__webpack_require__(18));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function loadTextFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onloadend = function (event) {
      return resolve(reader.result);
    };

    reader.onerror = function (error) {
      return reject(error);
    };

    reader.readAsText(file);
  });
}

function loadPuppetImageFiles(textFile) {
  var puppetData = JSON.parse(textFile);
  return Promise.all([(0, _imageLoader.default)(puppetData.imageData), (0, _imageLoader.default)(puppetData.imageNoBGData), Promise.resolve(puppetData)]);
} // TODO:  validate json fields


function buildPuppetFromImagesAndJson(image, imageNoBG, puppetData) {
  var backgroundRemovalData = new ImageData(Uint8ClampedArray.from(puppetData.backgroundRemovalData.data), puppetData.backgroundRemovalData.width, puppetData.backgroundRemovalData.height);
  var puppetParams = {
    vertices: puppetData.verts,
    faces: puppetData.faces,
    controlPoints: puppetData.controlPoints,
    controlPointPositions: puppetData.controlPointPositions,
    image: image,
    imageNoBG: imageNoBG,
    backgroundRemovalData: backgroundRemovalData
  }; // TODO: move this logic to caller

  return (0, _PuppetFactory.default)(puppetParams);
}

function loadPuppetFromFile(file) {
  return loadTextFile(file).then(function (textFile) {
    return loadPuppetImageFiles(textFile);
  }).then(function (result) {
    var _result = _slicedToArray(result, 3),
        image = _result[0],
        imageNoBG = _result[1],
        puppetData = _result[2];

    return buildPuppetFromImagesAndJson(image, imageNoBG, puppetData);
  });
}

var _default = loadPuppetFromFile;
exports.default = _default;

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(183);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, ".styles__stage___28Zmd {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden; }\n\n.styles__dranimateCanvas___Nohgj {\n  width: 100%;\n  height: 100%; }\n\n.styles__topBar___1NCGD {\n  position: absolute;\n  top: 0;\n  width: 100%; }\n\n.styles__profileButton___1KKCW {\n  position: absolute;\n  top: 0;\n  right: 0;\n  margin: 10px; }\n\n.styles__fab___1zGiF {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  padding: 15px; }\n\n.styles__hiddenFilePicker___3PC-9 {\n  display: none; }\n\n.styles__lowerLeft___9PRT8 {\n  position: absolute;\n  left: 0;\n  bottom: 0;\n  padding: 15px;\n  border: 1px solid #000;\n  display: flex;\n  flex-direction: row;\n  justify-content: flex-start; }\n\n.styles__paramControl___1gfev {\n  position: absolute;\n  left: 0;\n  top: 0;\n  padding: 15px;\n  border: 1px solid #000; }\n", ""]);

// exports
exports.locals = {
	"stage": "styles__stage___28Zmd",
	"dranimateCanvas": "styles__dranimateCanvas___Nohgj",
	"topBar": "styles__topBar___1NCGD",
	"profileButton": "styles__profileButton___1KKCW",
	"fab": "styles__fab___1zGiF",
	"hiddenFilePicker": "styles__hiddenFilePicker___3PC-9",
	"lowerLeft": "styles__lowerLeft___9PRT8",
	"paramControl": "styles__paramControl___1gfev"
};

/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(185);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../node_modules/sass-loader/lib/loader.js!./baseStyles.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!../../node_modules/sass-loader/lib/loader.js!./baseStyles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(4)(false);
// imports


// module
exports.push([module.i, "html, body {\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 0;\n  font-family: \"Nunito\", \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 16px; }\n\nh1 {\n  margin: 0;\n  padding: 0; }\n\np {\n  margin: 0;\n  padding: 0; }\n\nbutton {\n  border: none;\n  outline: none;\n  background-color: Transparent;\n  background-repeat: no-repeat;\n  cursor: pointer; }\n\na:link {\n  color: inherit;\n  text-decoration: none;\n  border-bottom: 1px solid #FFF; }\n\na:active {\n  color: inherit;\n  text-decoration: none; }\n\na:visited {\n  color: inherit;\n  text-decoration: none; }\n\na:hover {\n  color: inherit;\n  text-decoration: none; }\n", ""]);

// exports


/***/ })
],[131]);
//# sourceMappingURL=main.map