!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.LabeledAxes=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ArrowHelper = (function (_THREE$Object3D) {
			function ArrowHelper(direction, origin, length, color, headLength, headRadius, headColor) {
						_classCallCheck(this, ArrowHelper);

						_get(Object.getPrototypeOf(ArrowHelper.prototype), "constructor", this).call(this);

						this.direction = direction || new THREE.Vector3(1, 0, 0);
						this.origin = origin || new THREE.Vector3(0, 0, 0);
						this.length = length || 50;
						this.color = color || "#FF0000";
						this.headLength = headLength || 6;
						this.headRadius = headRadius || headLength / 7;
						this.headColor = headColor || this.color;

						//dir, origin, length, hex
						var lineGeometry = new THREE.Geometry();
						lineGeometry.vertices.push(this.origin);
						lineGeometry.vertices.push(this.direction.setLength(this.length));
						this.line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: this.color }));
						this.add(this.line);

						this.arrowHeadRootPosition = this.origin.clone().add(this.direction);
						this.head = new THREE.Mesh(new THREE.CylinderGeometry(0, this.headRadius, this.headLength, 8, 1, false), new THREE.MeshBasicMaterial({ color: this.headColor }));
						this.head.position.copy(this.arrowHeadRootPosition);

						this.head.lookAt(this.arrowHeadRootPosition.clone().add(this.direction.clone().setLength(this.headLength)));
						this.head.rotateX(Math.PI / 2);

						this.add(this.head);
			}

			_inherits(ArrowHelper, _THREE$Object3D);

			return ArrowHelper;
})(THREE.Object3D);

exports.ArrowHelper = ArrowHelper;
Object.defineProperty(exports, "__esModule", {
			value: true
});

},{}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

console.log("gee");

var ArrowHelper = require("./ArrowHelper").ArrowHelper;

var LabeledAxes = (function (_THREE$Object3D) {
  function LabeledAxes(options) {
    _classCallCheck(this, LabeledAxes);

    console.log("here");
    _get(Object.getPrototypeOf(LabeledAxes.prototype), "constructor", this).call(this);

    /*const DEFAULTS = {
      name : "",
      debug:false
    }
    let options = Object.assign({}, DEFAULTS, options); 
    super(options);
    
    Object.assign(this, options);*/

    var options = options || {};
    this.size = options.size !== undefined ? options.size : 50;
    this.xColor = options.xColor !== undefined ? options.xColor : "0xFF7700";
    this.yColor = options.yColor !== undefined ? options.yColor : "0x77FF00";
    this.zColor = options.zColor !== undefined ? options.zColor : "0x0077FF";

    this.fontSize = options.fontSize !== undefined ? options.fontSize : 6;
    this.textColor = options.textColor !== undefined ? options.textColor : "#000";

    this.arrowSize = options.arrowSize !== undefined ? options.arrowSize : 3;

    var addLabels = options.addLabels !== undefined ? options.addLabels : true;
    var addArrows = options.addArrows !== undefined ? options.addArrows : true;

    this.xColor = new THREE.Color().setHex(this.xColor);
    this.yColor = new THREE.Color().setHex(this.yColor);
    this.zColor = new THREE.Color().setHex(this.zColor);

    if (addLabels == true) {
      var s = this.size;
      var fontSize = this.fontSize;

      this.xLabel = this._drawText("X", fontSize);
      this.xLabel.position.set(s, 0, 0);

      this.yLabel = this._drawText("Y", fontSize);
      this.yLabel.position.set(0, s, 0);

      this.zLabel = this._drawText("Z", fontSize);
      this.zLabel.position.set(0, 0, s);
    }
    if (addArrows == true) {
      s = this.size / 1.25; // THREE.ArrowHelper arrow length
      this.xArrow = new ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), s, this.xColor, this.arrowSize);
      this.yArrow = new ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), s, this.yColor, this.arrowSize);
      this.zArrow = new ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), s, this.zColor, this.arrowSize);
      this.add(this.xArrow);
      this.add(this.yArrow);
      this.add(this.zArrow);
    } else {
      this._buildAxes();
    }

    this.add(this.xLabel);
    this.add(this.yLabel);
    this.add(this.zLabel);
    this.name = "axes";

    //Make sure arrows are always visible (through objects)
    //not working in all cases ?
    this.xArrow.line.material.depthTest = false;
    this.xArrow.head.material.depthTest = false;

    this.yArrow.line.material.depthTest = false;
    this.yArrow.head.material.depthTest = false;

    this.zArrow.line.material.depthTest = false;
    this.zArrow.head.material.depthTest = false;
  }

  _inherits(LabeledAxes, _THREE$Object3D);

  _prototypeProperties(LabeledAxes, null, {
    toggle: {
      value: (function (_toggle) {
        var _toggleWrapper = function toggle(_x) {
          return _toggle.apply(this, arguments);
        };

        _toggleWrapper.toString = function () {
          return _toggle.toString();
        };

        return _toggleWrapper;
      })(function (toggle) {
        //apply visibility settings to all children
        this.traverse(function (child) {
          child.visible = toggle;
        });
      }),
      writable: true,
      configurable: true
    },
    _buildAxes: {
      value: function _buildAxes() {

        lineGeometryX = new THREE.Geometry();
        lineGeometryX.vertices.push(new THREE.Vector3(-this.size, 0, 0));
        lineGeometryX.vertices.push(new THREE.Vector3(this.size, 0, 0));
        xLine = new THREE.Line(lineGeometryX, new THREE.LineBasicMaterial({ color: this.xColor }));

        lineGeometryY = new THREE.Geometry();
        lineGeometryY.vertices.push(new THREE.Vector3(0, -this.size, 0));
        lineGeometryY.vertices.push(new THREE.Vector3(0, this.size, 0));
        yLine = new THREE.Line(lineGeometryY, new THREE.LineBasicMaterial({ color: this.yColor }));

        lineGeometryZ = new THREE.Geometry();
        lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, -this.size));
        lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, this.size));
        zLine = new THREE.Line(lineGeometryZ, new THREE.LineBasicMaterial({ color: this.zColor }));

        this.add(xLine);
        this.add(yLine);
        this.add(zLine);
      },
      writable: true,
      configurable: true
    },
    _drawText: {
      value: function _drawText(text, fontSize, fontFace, textColor, background, scale) {
        var fontSize = fontSize || 18;
        var fontFace = fontFace || "Arial";
        var textColor = textColor || "#000000";
        var background = background || false;
        var scale = scale || 1;

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = "Bold " + fontSize + "px " + fontFace;

        // get size data (height depends only on font size)
        var metrics = context.measureText(text);
        var textWidth = metrics.width;

        // text color
        context.strokeStyle = textColor;
        context.fillStyle = textColor;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        //context.strokeText(text, canvas.width/2, canvas.height/2)

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, color: 16777215 });
        spriteMaterial.depthTest = false;
        //spriteMaterial.renderDepth = 1e20

        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100 * scale, 50 * scale, 1);
        return sprite;
      },
      writable: true,
      configurable: true
    }
  });

  return LabeledAxes;
})(THREE.Object3D);

module.exports = LabeledAxes;

//export { LabeledAxes };

},{"./ArrowHelper":1}]},{},[2])(2)
});