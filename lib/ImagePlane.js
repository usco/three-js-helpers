!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ImagePlane=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ImagePlane = (function (_THREE$Object3D) {
  function ImagePlane(width, length, imgUrl, resolution, upVector) {
    _classCallCheck(this, ImagePlane);

    _get(Object.getPrototypeOf(ImagePlane.prototype), "constructor", this).call(this);
    this.width = width || 200;
    this.length = length || 200;
    this.imgUrl = imgUrl || "";
    this.upVector = upVector || new THREE.Vector3(0, 1, 0);

    this.userData.unselectable = true; // this should never be selectable
    this._drawPlane();
  }

  _inherits(ImagePlane, _THREE$Object3D);

  _prototypeProperties(ImagePlane, null, {
    _drawPlane: {
      value: function _drawPlane() {
        //create plane for shadow projection  
        var width = this.width;
        var length = this.length;
        var shadowColor = this.shadowColor;

        var planeGeometry = new THREE.PlaneBufferGeometry(-width, length, 1, 1);
        var texture = THREE.ImageUtils.loadTexture(this.imgUrl);
        var planeMaterial = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide });
        //create plane for image display   
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x = Math.PI;
        this.plane.position.z = -0.2;
        this.name = "shadowPlane";
        this.plane.receiveShadow = true;

        this.add(this.plane);
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
    }
  });

  return ImagePlane;
})(THREE.Object3D);

//export { ImagePlane };
module.exports = ImagePlane;

},{}]},{},[1])(1)
});