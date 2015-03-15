!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.MirrorPlane=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * @author Slayvin / http://slayvin.net
 */

THREE.ShaderLib.mirror = {

	uniforms: { mirrorColor: { type: "c", value: new THREE.Color(8355711) },
		mirrorSampler: { type: "t", value: null },
		textureMatrix: { type: "m4", value: new THREE.Matrix4() }
	},

	vertexShader: ["uniform mat4 textureMatrix;", "varying vec4 mirrorCoord;", "void main() {", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "vec4 worldPosition = modelMatrix * vec4( position, 1.0 );", "mirrorCoord = textureMatrix * worldPosition;", "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),

	fragmentShader: ["uniform vec3 mirrorColor;", "uniform sampler2D mirrorSampler;", "varying vec4 mirrorCoord;", "float blendOverlay(float base, float blend) {", "return( base < 0.5 ? ( 2.0 * base * blend ) : (1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );", "}", "void main() {", "vec4 color = texture2DProj(mirrorSampler, mirrorCoord);", "color = vec4(blendOverlay(mirrorColor.r, color.r), blendOverlay(mirrorColor.g, color.g), blendOverlay(mirrorColor.b, color.b), 1.0);", "gl_FragColor = color;", "}"].join("\n")

};

var THREE_Mirror = function THREE_Mirror(renderer, camera, options) {

	THREE.Object3D.call(this);

	this.name = "mirror_" + this.id;

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = options.textureWidth !== undefined ? options.textureWidth : 512;
	var height = options.textureHeight !== undefined ? options.textureHeight : 512;

	this.clipBias = options.clipBias !== undefined ? options.clipBias : 0;

	var mirrorColor = options.color !== undefined ? new THREE.Color(options.color) : new THREE.Color(8355711);

	this.renderer = renderer;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3(0, 0, 1);
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3(0, 0, -1);
	this.clipPlane = new THREE.Vector4();

	// For debug only, show the normal and plane of the mirror
	var debugMode = options.debugMode !== undefined ? options.debugMode : false;

	if (debugMode) {

		var arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 10, 16777088);
		var planeGeometry = new THREE.Geometry();
		planeGeometry.vertices.push(new THREE.Vector3(-10, -10, 0));
		planeGeometry.vertices.push(new THREE.Vector3(10, -10, 0));
		planeGeometry.vertices.push(new THREE.Vector3(10, 10, 0));
		planeGeometry.vertices.push(new THREE.Vector3(-10, 10, 0));
		planeGeometry.vertices.push(planeGeometry.vertices[0]);
		var plane = new THREE.Line(planeGeometry, new THREE.LineBasicMaterial({ color: 16777088 }));

		this.add(arrow);
		this.add(plane);
	}

	if (camera instanceof THREE.PerspectiveCamera) {

		this.camera = camera;
	} else {

		this.camera = new THREE.PerspectiveCamera();
		console.log(this.name + ": camera is not a Perspective Camera!");
	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();

	this.texture = new THREE.WebGLRenderTarget(width, height);
	this.tempTexture = new THREE.WebGLRenderTarget(width, height);

	var mirrorShader = THREE.ShaderLib.mirror;
	var mirrorUniforms = THREE.UniformsUtils.clone(mirrorShader.uniforms);

	this.material = new THREE.ShaderMaterial({

		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: mirrorUniforms

	});

	this.material.uniforms.mirrorSampler.value = this.texture;
	this.material.uniforms.mirrorColor.value = mirrorColor;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;

	if (!THREE.Math.isPowerOfTwo(width) || !THREE.Math.isPowerOfTwo(height)) {

		this.texture.generateMipmaps = false;
		this.tempTexture.generateMipmaps = false;
	}

	this.updateTextureMatrix();
	this.render();
};

THREE_Mirror.prototype = Object.create(THREE.Object3D.prototype);

THREE_Mirror.prototype.renderWithMirror = function (otherMirror) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var tempCamera = otherMirror.camera;
	otherMirror.camera = this.mirrorCamera;

	// render the other mirror in temp texture
	otherMirror.renderTemp();
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	// restore material and camera of other mirror
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
	otherMirror.camera = tempCamera;

	// restore texture matrix of other mirror
	otherMirror.updateTextureMatrix();
};

THREE_Mirror.prototype.updateTextureMatrix = function () {

	var sign = Math.sign;

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld);
	this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

	this.rotationMatrix.extractRotation(this.matrixWorld);

	this.normal.set(0, 0, 1);
	this.normal.applyMatrix4(this.rotationMatrix);

	var view = this.mirrorWorldPosition.clone().sub(this.cameraWorldPosition);
	view.reflect(this.normal).negate();
	view.add(this.mirrorWorldPosition);

	this.rotationMatrix.extractRotation(this.camera.matrixWorld);

	this.lookAtPosition.set(0, 0, -1);
	this.lookAtPosition.applyMatrix4(this.rotationMatrix);
	this.lookAtPosition.add(this.cameraWorldPosition);

	var target = this.mirrorWorldPosition.clone().sub(this.lookAtPosition);
	target.reflect(this.normal).negate();
	target.add(this.mirrorWorldPosition);

	this.up.set(0, -1, 0);
	this.up.applyMatrix4(this.rotationMatrix);
	this.up.reflect(this.normal).negate();

	this.mirrorCamera.position.copy(view);
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt(target);

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

	// Update the texture matrix
	this.textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
	this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
	this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
	this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

	this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = (sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
	q.y = (sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
	q.z = -1;
	q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar(2 / this.clipPlane.dot(q));

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[2] = c.x;
	projectionMatrix.elements[6] = c.y;
	projectionMatrix.elements[10] = c.z + 1 - this.clipBias;
	projectionMatrix.elements[14] = c.w;
};

THREE_Mirror.prototype.render = function () {

	if (this.matrixNeedsUpdate) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while (scene.parent !== undefined) {

		scene = scene.parent;
	}

	if (scene !== undefined && scene instanceof THREE.Scene) {

		this.renderer.render(scene, this.mirrorCamera, this.texture, true);
	}
};

THREE_Mirror.prototype.renderTemp = function () {

	if (this.matrixNeedsUpdate) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while (scene.parent !== undefined) {

		scene = scene.parent;
	}

	if (scene !== undefined && scene instanceof THREE.Scene) {

		this.renderer.render(scene, this.mirrorCamera, this.tempTexture, true);
	}
};

exports.THREE_Mirror = THREE_Mirror;
Object.defineProperty(exports, "__esModule", {
	value: true
});

},{}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var THREE_Mirror = require("./Mirror").THREE_Mirror;

var MirrorPlane = (function (_THREE$Object3D) {
  function MirrorPlane(width, length, resolution, color, upVector) {
    _classCallCheck(this, MirrorPlane);

    _get(Object.getPrototypeOf(MirrorPlane.prototype), "constructor", this).call(this);
    this.width = width || 200;
    this.length = length || 200;
    this.resolution = resolution || 128;
    this.color = color || 7829367;
    this.upVector = upVector || new THREE.Vector3(0, 1, 0);

    this.userData.unselectable = true; // this should never be selectable
    this._drawPlane();
  }

  _inherits(MirrorPlane, _THREE$Object3D);

  _prototypeProperties(MirrorPlane, null, {
    _drawPlane: {
      value: function _drawPlane() {
        //create plane for shadow projection  
        var width = this.width;
        var length = this.length;

        var groundMirror = new THREE_Mirror(null, null, { clipBias: 0.003, textureWidth: this.resolution, textureHeight: this.resolution, color: this.color });
        var planeGeometry = new THREE.PlaneBufferGeometry(width, length, 1, 1);
        var planeMaterial = groundMirror.material;

        //create plane for reflection
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.position.z = -0.8;
        this.plane.doubleSided = true;
        this.name = "MirrorPlane";
        this.plane.add(groundMirror);
        this.mirrorCamera = groundMirror;

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

  return MirrorPlane;
})(THREE.Object3D);

//export { MirrorPlane };
module.exports = MirrorPlane;

},{"./Mirror":1}]},{},[2])(2)
});