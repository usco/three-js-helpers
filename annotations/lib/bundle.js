(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseHelper = require("./base/BaseHelper");

/*
Base helper for all annotations
*/

var AnnotationHelper = (function (BaseHelper) {
  function AnnotationHelper(options) {
    _classCallCheck(this, AnnotationHelper);

    var DEFAULTS = {
      name: "",
      drawArrows: true,
      drawLeftArrow: true,
      drawRightArrow: true,
      arrowColor: "000",
      arrowsPlacement: "dynamic", //can be either, dynamic, inside, outside
      arrowHeadSize: 2,
      arrowHeadWidth: 0.8,

      lineWidth: 1,
      drawSideLines: true,
      sideLength: 0,
      sideLengthExtra: 2, //how much sidelines should stick out
      sideLineColor: "000",
      sideLineSide: "front",

      drawLabel: true,
      labelPos: "center",
      labelType: "flat", //frontFacing or flat
      fontSize: 10,
      fontFace: "Jura",
      textColor: "#000",
      textBgColor: null,
      lengthAsLabel: true, //TODO: "length is too specific change that"
      textPrefix: "" };

    //TODO: how to deal with lineWidth would require not using simple lines but strips
    //see ANGLE issue on windows platforms

    var options = Object.assign({}, DEFAULTS, options);

    _get(Object.getPrototypeOf(AnnotationHelper.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);

    /*this would be practical for "human referencing": ie
    for example "front mount hole" for a given measurement etc
    should name uniqueness be enforced ? yes, makes sense!
    */
    //this.name = "";

    //can this object be translated/rotated/scaled on its own ? NOPE
    this.transformable = false;
  }

  _inherits(AnnotationHelper, BaseHelper);

  return AnnotationHelper;
})(BaseHelper);

module.exports = AnnotationHelper;
//TODO: perhas a "textformat method would be better ??

},{"./base/BaseHelper":3}],2:[function(require,module,exports){
"use strict";

var AnnotationHelper = require("./AnnotationHelper.js");

/*var BaseHelper = require("../BaseHelper.js" );
var GizmoMaterial = require("../GizmoMaterial.js" );
var AnnotationHelper = require("./AnnotationHelper.js" );
var ArrowHelper2 = require("./ArrowHelper2.js" );
var Box3Custom = require("./Box3-Custom.js" );

var LabelHelper = require("../LabelHelper.js" );
var CrossHelper = require("./CrossHelper.js" );
var CircleHelper = require("./CircleHelper.js" );
var ArcHelper = require("./ArcHelper.js" );

var LeaderLineHelper = require("./LeaderLineHelper.js" );
var DistanceHelper = require("./DistanceHelper.js" );
var SizeHelper = require("./SizeHelper.js" );
var CenterHelper = require("./CenterHelper.js" );
var DiameterHelper = require("./DiameterHelper.js" );
var AngDimHelper = require("./AngDimHelper.js" );
var DimensionsHelper = require("./DimensionsHelper.js" );

var ThicknessHelper = require("./ThicknessHelper.js" );*/

},{"./AnnotationHelper.js":1}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
Abstract Base helper class
*/

var AnnotationHelper = (function (_THREE$Object3D) {
		function AnnotationHelper(options) {
				_classCallCheck(this, AnnotationHelper);

				var DEFAULTS = {
						name: "" };

				_get(Object.getPrototypeOf(AnnotationHelper.prototype), "constructor", this).call(this);
		}

		_inherits(AnnotationHelper, _THREE$Object3D);

		_prototypeProperties(AnnotationHelper, null, {
				setAsSelectionRoot: {
						value: function setAsSelectionRoot(flag) {
								this.traverse(function (child) {
										child.selectable = !flag;
										child.selectTrickleUp = flag;
								});
								this.selectable = flag;
								this.selectTrickleUp = !flag;
						},
						writable: true,
						configurable: true
				},
				hide: {
						value: function hide() {
								this.traverse(function (child) {
										child.visible = false;
								});
						},
						writable: true,
						configurable: true
				},
				show: {
						value: function show() {
								this.traverse(function (child) {
										child.visible = true;
								});
						},
						writable: true,
						configurable: true
				},
				setOpacity: {
						value: function setOpacity(opacityPercent) {
								this.traverse(function (child) {
										if (child.material) {
												child.material.opacity = child.material.opacity * opacityPercent;
												if (child.material.opacity < 1) {
														child.material.transparent = true;
												}
												//console.log("applying opacity to ",child);
										} else {}
								});
						},
						writable: true,
						configurable: true
				},
				highlight: {
						value: function highlight(flag) {
								this.traverse(function (child) {
										if (child.material && child.material.highlight) {
												child.material.highlight(flag);
										}
								});
						},
						writable: true,
						configurable: true
				},
				highlight2: {
						value: function highlight2(item) {
								this.traverse(function (child) {
										if (child.material && child.material.highlight) {
												if (child === item) {
														child.material.highlight(true);
														return;
												} else {
														child.material.highlight(false);
												}
										}
								});
						},
						writable: true,
						configurable: true
				}
		});

		return AnnotationHelper;
})(THREE.Object3D);

module.exports = AnnotationHelper;
/*BaseHelper = function()
{
  THREE.Object3D.call( this );
}

BaseHelper.prototype = Object.create( THREE.Object3D.prototype );
BaseHelper.prototype.constructor = BaseHelper;*/

//console.log("not applying opacity to",child);

},{}]},{},[2]);
