!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.CircularLabeledGrid=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//TODO refactor HEAVILLY

var CircularLabeledGrid = (function (_THREE$Object3D) {
  function CircularLabeledGrid(diameter, step, upVector, color, opacity, text, textColor, textPosition) {
    _classCallCheck(this, CircularLabeledGrid);

    var DEFAULTS = {
      diameter: 200,
      step: 100,
      color: 16777215,
      opacity: 0.1,
      addText: true,
      textColor: "#FFFFFF",
      textLocation: "f",
      rootAssembly: null
    };
    _get(Object.getPrototypeOf(CircularLabeledGrid.prototype), "constructor", this).call(this);

    this.diameter = diameter || 200;
    this.step = step || 100;
    this.color = color || 47871;
    this.opacity = opacity || 0.2;
    this.text = text || true;
    this.textColor = textColor || "#000000";
    this.textPosition = "center";
    this.upVector = upVector || new THREE.Vector3(0, 1, 0);

    this.name = "grid";

    //TODO: clean this up
    this.marginSize = 10;
    this.stepSubDivisions = 10;

    this._drawGrid();

    //default grid orientation is z up, rotate if not the case
    var upVector = this.upVector;
    this.up = upVector;
    this.lookAt(upVector);
  }

  _inherits(CircularLabeledGrid, _THREE$Object3D);

  _prototypeProperties(CircularLabeledGrid, null, {
    _drawGrid: {
      value: function _drawGrid() {
        var gridGeometry, gridMaterial, mainGridZ, planeFragmentShader, planeGeometry, planeMaterial, subGridGeometry, subGridMaterial, subGridZ;

        //offset to avoid z fighting
        mainGridZ = -0.05;
        gridGeometry = new THREE.Geometry();
        gridMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHex(this.color),
          opacity: this.opacity,
          linewidth: 2,
          transparent: true
        });

        subGridZ = -0.05;
        subGridGeometry = new THREE.Geometry();
        subGridMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHex(this.color),
          opacity: this.opacity / 2,
          transparent: true
        });

        var step = this.step;
        var stepSubDivisions = this.stepSubDivisions;
        var diameter = this.diameter;
        var radius = diameter / 2;
        var width = this.diameter;
        var length = this.diameter;

        var centerBased = true;

        function getStart(offset) {
          var angle = Math.asin(offset / radius);

          var start = Math.cos(angle) * radius;
          return start;
        }

        if (centerBased) {
          for (var i = 0; i <= width / 2; i += step / stepSubDivisions) {
            var start = getStart(i);

            subGridGeometry.vertices.push(new THREE.Vector3(-start, i, subGridZ));
            subGridGeometry.vertices.push(new THREE.Vector3(start, i, subGridZ));

            subGridGeometry.vertices.push(new THREE.Vector3(-start, -i, subGridZ));
            subGridGeometry.vertices.push(new THREE.Vector3(start, -i, subGridZ));

            if (i % step == 0) {
              gridGeometry.vertices.push(new THREE.Vector3(-start, i, mainGridZ));
              gridGeometry.vertices.push(new THREE.Vector3(start, i, mainGridZ));

              gridGeometry.vertices.push(new THREE.Vector3(-start, -i, mainGridZ));
              gridGeometry.vertices.push(new THREE.Vector3(start, -i, mainGridZ));
            }
          }
          for (var i = 0; i <= length / 2; i += step / stepSubDivisions) {
            var start = getStart(i);
            subGridGeometry.vertices.push(new THREE.Vector3(i, -start, subGridZ));
            subGridGeometry.vertices.push(new THREE.Vector3(i, start, subGridZ));

            subGridGeometry.vertices.push(new THREE.Vector3(-i, -start, subGridZ));
            subGridGeometry.vertices.push(new THREE.Vector3(-i, start, subGridZ));

            if (i % step == 0) {
              gridGeometry.vertices.push(new THREE.Vector3(i, -start, mainGridZ));
              gridGeometry.vertices.push(new THREE.Vector3(i, start, mainGridZ));

              gridGeometry.vertices.push(new THREE.Vector3(-i, -start, mainGridZ));
              gridGeometry.vertices.push(new THREE.Vector3(-i, start, mainGridZ));
            }
          }
        }
        //create main & sub grid objects
        this.mainGrid = new THREE.Line(gridGeometry, gridMaterial, THREE.LinePieces);
        this.subGrid = new THREE.Line(subGridGeometry, subGridMaterial, THREE.LinePieces);

        //create margin
        var offsetWidth = width + this.marginSize;
        var offsetLength = length + this.marginSize;
        var segments = 128;

        var marginGeometry = new THREE.CircleGeometry(diameter / 2 + this.marginSize / 2, segments);
        var marginGeometry2 = new THREE.CircleGeometry(diameter / 2, segments);

        marginGeometry.vertices.shift();
        marginGeometry2.vertices.shift();
        marginGeometry.merge(marginGeometry2);

        var strongGridMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHex(this.color),
          opacity: this.opacity * 2,
          linewidth: 2,
          transparent: true
        });
        this.margin = new THREE.Line(marginGeometry, strongGridMaterial);

        //add all grids, subgrids, margins etc
        this.add(this.mainGrid);
        this.add(this.subGrid);
        this.add(this.margin);

        //this._drawNumbering();
      },
      writable: true,
      configurable: true
    },
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
    setOpacity: {
      value: function setOpacity(opacity) {
        this.opacity = opacity;
        this.mainGrid.material.opacity = opacity;
        this.subGrid.material.opacity = opacity / 2;
        this.margin.material.opacity = opacity * 2;
      },
      writable: true,
      configurable: true
    },
    setColor: {
      value: function setColor(color) {
        this.color = color;
        this.mainGrid.material.color = new THREE.Color().setHex(this.color);
        this.subGrid.material.color = new THREE.Color().setHex(this.color);
        this.margin.material.color = new THREE.Color().setHex(this.color);
      },
      writable: true,
      configurable: true
    },
    toggleText: {
      value: function toggleText(toggle) {
        this.text = toggle;
        var labels = this.labels.children;
        for (var i = 0; i < this.labels.children.length; i++) {
          var label = labels[i];
          label.visible = toggle;
        }
      },
      writable: true,
      configurable: true
    },
    setTextColor: {
      value: function setTextColor(color) {
        this.textColor = color;
        this._drawNumbering();
      },
      writable: true,
      configurable: true
    },
    setTextLocation: {
      value: function setTextLocation(location) {
        this.textLocation = location;
        return this._drawNumbering();
      },
      writable: true,
      configurable: true
    },
    setUp: {
      value: function setUp(upVector) {
        this.upVector = upVector;
        this.up = upVector;
        this.lookAt(upVector);
      },
      writable: true,
      configurable: true
    },
    resize: {
      value: function resize(width, length) {
        if (width && length) {
          var width = Math.max(width, 10);
          this.diameter = width;

          var length = Math.max(length, 10);
          this.length = length;

          this.step = Math.max(this.step, 5);

          this.remove(this.mainGrid);
          this.remove(this.subGrid);
          this.remove(this.margin);
          //this.remove(this.plane);
          return this._drawGrid();
        }
      },
      writable: true,
      configurable: true
    },
    _drawNumbering: {
      value: function _drawNumbering() {
        var label, sizeLabel, sizeLabel2, xLabelsLeft, xLabelsRight, yLabelsBack, yLabelsFront;
        var step = this.step;

        this._labelStore = {};

        if (this.labels != null) {
          this.mainGrid.remove(this.labels);
        }
        this.labels = new THREE.Object3D();

        var width = this.width;
        var length = this.length;
        var numbering = this.numbering = "centerBased";

        var labelsFront = new THREE.Object3D();
        var labelsSideRight = new THREE.Object3D();

        if (numbering == "centerBased") {
          for (var i = 0; i <= width / 2; i += step) {
            var sizeLabel = this.drawTextOnPlane("" + i, 32);
            var sizeLabel2 = sizeLabel.clone();

            sizeLabel.position.set(length / 2, -i, 0.1);
            sizeLabel.rotation.z = -Math.PI / 2;
            labelsFront.add(sizeLabel);

            sizeLabel2.position.set(length / 2, i, 0.1);
            sizeLabel2.rotation.z = -Math.PI / 2;
            labelsFront.add(sizeLabel2);
          }

          for (var i = 0; i <= length / 2; i += step) {
            var sizeLabel = this.drawTextOnPlane("" + i, 32);
            var sizeLabel2 = sizeLabel.clone();

            sizeLabel.position.set(-i, width / 2, 0.1);
            //sizeLabel.rotation.z = -Math.PI / 2;
            labelsSideRight.add(sizeLabel);

            sizeLabel2.position.set(i, width / 2, 0.1);
            //sizeLabel2.rotation.z = -Math.PI / 2;
            labelsSideRight.add(sizeLabel2);
          }

          labelsSideLeft = labelsSideRight.clone();
          labelsSideLeft.rotation.z = -Math.PI;
          //labelsSideLeft = labelsSideRight.clone().translateY(- width );

          labelsBack = labelsFront.clone();
          labelsBack.rotation.z = -Math.PI;
        }
        /*if (this.textLocation === "center") {
          yLabelsRight.translateY(- length/ 2);
          xLabelsFront.translateX(- width / 2);
        } else {
          yLabelsLeft = yLabelsRight.clone().translateY( -width );
          xLabelsBack = xLabelsFront.clone().translateX( -length );
          
          this.labels.add( yLabelsLeft );
          this.labels.add( xLabelsBack) ;
        }*/
        //this.labels.add( yLabelsRight );
        this.labels.add(labelsFront);
        this.labels.add(labelsBack);

        this.labels.add(labelsSideRight);
        this.labels.add(labelsSideLeft);

        //apply visibility settings to all labels
        var textVisible = this.text;
        this.labels.traverse(function (child) {
          child.visible = textVisible;
        });

        this.mainGrid.add(this.labels);
      },
      writable: true,
      configurable: true
    },
    drawTextOnPlane: {
      value: function drawTextOnPlane(text, size) {
        var canvas, context, material, plane, texture;

        if (size == null) {
          size = 256;
        }

        canvas = document.createElement("canvas");
        var size = 128;
        canvas.width = size;
        canvas.height = size;
        context = canvas.getContext("2d");
        context.font = "18px sans-serif";
        context.textAlign = "center";
        context.fillStyle = this.textColor;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        context.strokeStyle = this.textColor;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);

        texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.generateMipmaps = true;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          color: 16777215,
          alphaTest: 0.3
        });
        plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(size / 8, size / 8), material);
        plane.doubleSided = true;
        plane.overdraw = true;

        return plane;
      },
      writable: true,
      configurable: true
    }
  });

  return CircularLabeledGrid;
})(THREE.Object3D);

//export {CircularLabeledGrid};
module.exports = CircularLabeledGrid;

//

//autoresize, disabled for now
/*
updateGridSize() {
      var max, maxX, maxY, min, minX, minY, size, subchild, _getBounds, _i, _len, _ref,
        _this = this;
      minX = 99999;
      maxX = -99999;
      minY = 99999;
      maxY = -99999;
      _getBounds = function(mesh) {
        var bBox, subchild, _i, _len, _ref, _results;
        if (mesh instanceof THREE.Mesh) {
          mesh.geometry.computeBoundingBox();
          bBox = mesh.geometry.boundingBox;
          minX = Math.min(minX, bBox.min.x);
          maxX = Math.max(maxX, bBox.max.x);
          minY = Math.min(minY, bBox.min.y);
          maxY = Math.max(maxY, bBox.max.y);
          _ref = mesh.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            subchild = _ref[_i];
            _results.push(_getBounds(subchild));
          }
          return _results;
        }
      };
      if (this.rootAssembly != null) {
        _ref = this.rootAssembly.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subchild = _ref[_i];
          if (subchild.name !== "renderSubs" && subchild.name !== "connectors") {
            _getBounds(subchild);
          }
        }
      }
      max = Math.max(Math.max(maxX, maxY), 100);
      min = Math.min(Math.min(minX, minY), -100);
      size = (Math.max(max, Math.abs(min))) * 2;
      size = Math.ceil(size / 10) * 10;
      if (size >= 200) {
        return this.resize(size);
      }
};
*/

},{}]},{},[1])(1)
});