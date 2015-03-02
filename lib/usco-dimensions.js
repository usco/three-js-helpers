!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ObjectDimensionsHelper=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";

var Box3C = function Box3C(options) {
	THREE.Box3.call(this);
};
Box3C.prototype = Object.create(THREE.Box3.prototype);
//Box3C.prototype.constructor = AnnotationHelper; 

Box3C.prototype.setFromObject = (function () {

	// Computes the world-axis-aligned bounding box of an object (including its children),
	// accounting for both the object's, and childrens', world transforms

	var v1 = new THREE.Vector3();
	//console.log("gna");

	return function (object) {
		var scope = this;

		object.updateMatrixWorld(true);

		this.makeEmpty();

		function goDown(node) {

			//exclude annotations
			if (node instanceof AnnotationHelper) {
				return;
			}
			var geometry = node.geometry;

			if (geometry !== undefined) {

				if (geometry instanceof THREE.Geometry) {

					var vertices = geometry.vertices;

					for (var i = 0, il = vertices.length; i < il; i++) {

						v1.copy(vertices[i]);

						v1.applyMatrix4(node.matrixWorld);

						scope.expandByPoint(v1);
					}
				} else if (geometry instanceof THREE.BufferGeometry && geometry.attributes.position !== undefined) {

					var positions = geometry.attributes.position.array;

					for (var i = 0, il = positions.length; i < il; i += 3) {

						v1.set(positions[i], positions[i + 1], positions[i + 2]);

						v1.applyMatrix4(node.matrixWorld);

						scope.expandByPoint(v1);
					}
				}
			}

			for (var i = 0, l = node.children.length; i < l; i++) {
				goDown(node.children[i]);
				//this.children[ i ].traverse( callback );
			}
		}

		goDown(object);

		return this;
	};
})();

module.exports = Box3C;

},{}],3:[function(require,module,exports){
"use strict";

GizmoMaterial = function (parameters) {
		THREE.MeshBasicMaterial.call(this);
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues(parameters);

		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : 16776960;

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function (highlighted) {

				if (highlighted) {

						this.color.set(this.highlightColor); //.setRGB( 1, 1, 0 );
						//this.opacity = 1;
				} else {

						this.color.copy(this.oldColor);
						//this.opacity = this.oldOpacity;
				}
		};
};

GizmoMaterial.prototype = Object.create(THREE.MeshBasicMaterial.prototype);

var GizmoLineMaterial = function GizmoLineMaterial(parameters) {
		THREE.LineBasicMaterial.call(this);
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues(parameters);

		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : "#ffd200";

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function (highlighted) {

				if (highlighted) {

						this.color.set(this.highlightColor); //.setRGB( 1, 1, 0 );
						//this.opacity = 1;
				} else {

						this.color.copy(this.oldColor);
						//this.opacity = this.oldOpacity;
				}
		};
};

GizmoLineMaterial.prototype = Object.create(THREE.LineBasicMaterial.prototype);

module.exports = { GizmoMaterial: GizmoMaterial, GizmoLineMaterial: GizmoLineMaterial };

},{}],4:[function(require,module,exports){
"use strict";

var BaseHelper = require("./BaseHelper");

//TODO: correctly map ogl units to fontSize to canvasSize etc
var LabelHelper = function LabelHelper(options) {
  BaseHelper.call(this);

  var options = options || {};
  this.text = options.text !== undefined ? options.text : " ";
  this.color = options.color || "rgba(0, 0, 0, 1)";

  //this.textColor  = options.textColor !== undefined ? options.textColor : "rgba(0, 0, 0, 1)";
  this.fontFace = options.fontFace || "Jura";
  this.fontWeight = options.fontWeight || "bold"; //"normal bolder";
  this.fontSize = options.fontSize || 10;
  this.fontStyle = "";
  this.background = options.background !== undefined ? options.background : true;

  this.bgColor = options.bgColor || "rgba(255, 255, 255, 1)";

  this._resolutionMultiplier = 8;
  this._alphaTest = 0.1;

  this.borderSize = 0;
  this.width = 0;
  this.height = 0;

  //texture upscaling ratio
  this.upscale = 10;

  //convertion of canvas to webglUnits
  this.baseRatio = 4;

  this.canvas = document.createElement("canvas");
  this.canvas.style.position = "absolute";
  this.canvas.width = 256;
  this.canvas.height = 256;

  this.context = this.canvas.getContext("2d");

  var texture = new THREE.Texture(this.canvas);
  this.texture = texture;

  this.measureText();
  this.drawText();
};

LabelHelper.prototype = Object.create(BaseHelper.prototype);
LabelHelper.prototype.constructor = LabelHelper;

LabelHelper.prototype.setText = function (text) {
  this.text = text;
  this.generateTextFromCanvas();
  this.generate();
};

LabelHelper.prototype.applyFontStyleToContext = function (measureMode) {
  var measureMode = measureMode !== undefined ? measureMode : true;

  var fontSize = this.charHeight;
  if (!measureMode) fontSize = this.scaledFontSize;

  var font = this.fontWeight + " " + this.fontStyle + " " + fontSize + "px " + this.fontFace;

  this.context.font = font;
  this.context.textBaseline = "middle";
  this.context.textAlign = "center";
};

LabelHelper.prototype.measureText = function (text) {

  var pixelRatio = window.devicePixelRatio || 1;
  var charWidth = 0;
  var charHeight = pixelRatio * this.fontSize;

  var canvas = this.canvas;
  var context = this.context;
  var fontFace = this.fontFace;
  var fontWeight = this.fontWeight;
  var fontStyle = this.fontStyle;
  var borderSize = this.borderSize;

  //canvas.width  = canvas.clientWidth  * pixelRatio;
  //canvas.height = canvas.clientHeight * pixelRatio;
  //console.log("canvas.width ",canvas.width ,"canvas.height",canvas.height);

  //var font = fontWeight +" "+ fontStyle +" " + charHeight +"px "+ fontFace;
  //font = font.trim()

  //context.font = font;
  //context.textBaseline = "center";
  //context.textAlign    = "center"
  this.applyFontStyleToContext();

  function getPowerOfTwo(value, pow) {
    var pow = pow || 1;
    while (pow < value) {
      pow *= 2;
    }
    return pow;
  }

  //FIXME: hackery based on measurement of specific characters
  charWidth = context.measureText(Array(100 + 1).join("M")).width / 100;
  this.charWidth = charWidth;
  this.charHeight = charHeight;

  var charWidth = context.measureText(Array(100 + 1).join("M")).width / 100;
  var charHeight = this.fontSize;

  var rWidth = charWidth * (this.text.length - 1);
  var rHeight = charHeight;
  var textWidth = context.measureText(text).width;
  var sqrWidth = getPowerOfTwo(textWidth);
  var sqrHeight = getPowerOfTwo(2 * this.fontSize);

  var upscale = this.upscale;
  var baseRatio = this.baseRatio;

  sqrWidth *= upscale;
  sqrHeight *= upscale;

  this.canvasWidth = sqrWidth;
  this.canvasHeight = sqrHeight;

  this.width = sqrWidth / (upscale * baseRatio);
  this.height = sqrHeight / (upscale * baseRatio);

  this.scaledFontSize = this.fontSize * upscale;

  this.textWidth = textWidth * upscale / (upscale * baseRatio);
  this.textHeight = rHeight * upscale / (upscale * baseRatio);

  //this.width      = ( charWidth * this.text.length-1 ) * this.canvasGLRatio + borderSize*2;
  //this.height     = charHeight * this.canvasGLRatio + borderSize*2;

  console.log("canvas", sqrWidth, sqrHeight, "Width/height", this.width, this.height, "text (glSizes)", this.textWidth, this.textHeight);
};

LabelHelper.prototype.drawText = function () {
  var canvas = this.canvas;
  var context = this.context;
  var text = this.text;

  var color = this.color;

  var fontWeight = this.fontWeight;
  var fontStyle = this.fontStyle;
  var fontFace = this.fontFace;
  var charHeight = this.charHeight;

  canvas.width = this.canvasWidth;
  canvas.height = this.canvasHeight;

  this.applyFontStyleToContext(false);

  context.clearRect(0, 0, canvas.width, canvas.height);

  //context.fillStyle = "#000000";
  //context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#ffffff";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  //textWidth
  //ctx.strokeStyle="red";
  //ctx.rect((canvas.width-rWidth)/2,(canvas.height-rHeight)/2,rWidth,rHeight);
  //ctx.stroke();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  console.log("texture", texture);

  //texture.magFilter = THREE.NearestFilter;
  //texture.minFilter = THREE.LinearMipMapLinearFilter;

  this._texture = texture;
};

LabelHelper.prototype.generateTextFromCanvas = function () {
  var canvas, context, material, plane, texture;
  var fontFace = this.fontFace;
  var fontWeight = this.fontWeight;
  var fontSize = this.fontSize;
  var text = this.text;
  var color = this.color;
  var background = this.background;
  var bgColor = this.bgColor;
  var borderThickness = 1;

  //color= "rgba(1, 1, 1, 1)";
  //var spriteAlignment = THREE.SpriteAlignment.topLeft;

  //for background drawing
  var bgRect = function bgRect(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    //ctx.stroke();
  };

  // function for drawing rounded rectangles
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  //this forces a higher resolution (for texts)
  var resMult = this._resolutionMultiplier;
  var borderSize = 5;
  //background = false;

  canvas = document.createElement("canvas");
  //  canvas.width = 340;
  context = canvas.getContext("2d");
  context.save();

  var rawFont = fontWeight + " " + fontSize * resMult * 1.5 + "px " + fontFace;
  context.font = rawFont;
  context.textBaseline = "top";
  context.textAlign = "center";

  var metrics = context.measureText(text);
  var width = metrics.width;
  var height = fontSize * resMult * 1.5 + borderSize;

  var fullWidth = width + borderSize * 2;
  var fullHeight = height + borderSize * 2;

  //console.log(" width",canvas.width, fullWidth);

  //console.log(" width", width, "height", height,metrics.width, fontSize,resMult,context.font, rawFont );
  this.width = fullWidth / resMult / 4;
  this.height = fullHeight / resMult / 4;

  if (background) {
    context.fillStyle = bgColor;
    context.strokeStyle = bgColor;
    context.fillRect(0, 0, fullWidth, fullHeight);
  }

  context.scale(0.9, 0.9);
  context.fillStyle = color;
  context.fillText(text, width / 2 + borderSize / 2, 0); //width/2, height/2);
  //context.lineWidth = 3;
  context.strokeStyle = color;
  context.strokeText(text, width / 2 + borderSize / 2, 0);
  context.restore();

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  this._texture = texture;
};

/*Perspective 3d helpers*/
var LabelHelper3d = function LabelHelper3d(options) {
  LabelHelper.call(this, options);
  this.generate();
};

LabelHelper3d.prototype = Object.create(LabelHelper.prototype);
LabelHelper3d.prototype.constructor = LabelHelper3d;

LabelHelper3d.prototype.generate = function () {

  var spriteMaterial = new THREE.SpriteMaterial({
    map: this._texture,
    transparent: true,
    alphaTest: this._alphaTest,
    useScreenCoordinates: false,
    scaleByViewport: false,
    color: this.color,
    side: THREE.DoubleSide });

  var width = this.width;
  var height = this.height;

  var textSprite = new THREE.Sprite(spriteMaterial);
  textSprite.scale.set(width, height, 1);

  this.textSprite = textSprite;
  this.add(textSprite);

  //var testCube = new THREE.Mesh(new THREE.CubeGeometry(width, height,  0.1), new THREE.MeshBasicMaterial({color:0xFF0000}));
  //this.add( testCube );
};

/*Flat (perspective not front facing) helper*/
var LabelHelperPlane = function LabelHelperPlane(options) {
  LabelHelper.call(this, options);
  this.generate();
};

LabelHelperPlane.prototype = Object.create(LabelHelper.prototype);
LabelHelperPlane.prototype.constructor = LabelHelperPlane;

LabelHelperPlane.prototype.generate = function () {

  var width = this.width;
  var height = this.height;

  //width = this.canvasWidth;
  //height = this.canvasHeight;
  console.log("width", width, "height", height);

  /*var dynamicTexture	= new DynamicTexture(width*10,height*10)
  dynamicTexture.context.font	= "bold "+10+"px Arial";
  dynamicTexture.clear();
  dynamicTexture.drawText(this.text, undefined, height/2, 'blue')
   this._texture = dynamicTexture.texture;*/

  var material = new GizmoMaterial({
    map: this._texture,
    transparent: true,
    color: this.color,
    alphaTest: this._alphaTest,
    side: THREE.FrontSide,
    shading: THREE.FlatShading });

  /*depthTest:false,
   depthWrite:false,
   renderDepth : 1e20,*/

  var textPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);

  if (this.textMesh) this.remove(this.textMesh);

  this.textMesh = textPlane;
  this.add(textPlane);

  if (this.textPlaneBack) this.remove(this.textPlaneBack);

  this.textPlaneBack = textPlane.clone();
  this.textPlaneBack.rotation.y = -Math.PI;
  this.add(this.textPlaneBack);
};

module.exports = { LabelHelperPlane: LabelHelperPlane, LabelHelper3d: LabelHelper3d };

//depthTest:false,
//depthWrite:false,
//renderDepth : 1e20

},{"./BaseHelper":1}],5:[function(require,module,exports){
"use strict";

var BaseOutline = function BaseOutline(length, width, midPoint) {
  THREE.Object3D.call(this);
  this.width = width;
  this.length = length;

  //TODO: replace with buffer geometry

  var baseOutlineGeometry = new THREE.Geometry();
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length / 2, -this.width / 2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length / 2, -this.width / 2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length / 2, this.width / 2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length / 2, this.width / 2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length / 2, -this.width / 2, 0));
  baseOutlineGeometry.computeLineDistances();

  var dashMaterial = new THREE.LineDashedMaterial({ color: 0, dashSize: 2.5,
    gapSize: 2, depthTest: false, linewidth: 1, opacity: 0.2, transparent: true });
  var baseOutlineBack = new THREE.Line(baseOutlineGeometry, dashMaterial, THREE.Lines);
  baseOutlineBack.renderDepth = 100000000000000000000;
  baseOutlineBack.position.copy(new THREE.Vector3(midPoint.x, midPoint.y, midPoint.z - this.height / 2));

  var dashMaterial2 = new THREE.LineDashedMaterial({ color: 0, dashSize: 2.5,
    gapSize: 2, depthTest: true, linewidth: 1 });
  var baseOutlineFront = baseOutlineBack.clone();
  baseOutlineFront.material = dashMaterial2;

  this.add(baseOutlineBack);
  this.add(baseOutlineFront);
  this.baseOutlineBack = baseOutlineBack;
  this.baseOutlineFront = baseOutlineFront;
  //THREE.Mesh.call(this, geometry, material);
};

BaseOutline.prototype = Object.create(THREE.Object3D.prototype);
BaseOutline.prototype.constructor = BaseOutline;

BaseOutline.prototype._updateGeometries = function () {

  var geoms = [this.baseOutlineBack.geometry, this.baseOutlineFront.geometry];

  for (var i = 0; i < geoms.length; i++) {
    var geom = geoms[i];
    geom.vertices[0].copy(new THREE.Vector3(-this.length / 2, -this.width / 2, 0));
    geom.vertices[1].copy(new THREE.Vector3(this.length / 2, -this.width / 2, 0));
    geom.vertices[2].copy(new THREE.Vector3(this.length / 2, this.width / 2, 0));
    geom.vertices[3].copy(new THREE.Vector3(-this.length / 2, this.width / 2, 0));
    geom.vertices[4].copy(new THREE.Vector3(-this.length / 2, -this.width / 2, 0));

    geom.dynamic = true;
    geom.verticesNeedUpdate = true;
  }

  //mesh.geometry.verticesNeedUpdate = true;
};

BaseOutline.prototype.setWidth = function (width) {
  this.width = width;
  this._updateGeometries();
};

BaseOutline.prototype.setLength = function (length) {
  this.length = length;
  this._updateGeometries();
};

module.exports = BaseOutline;

},{}],6:[function(require,module,exports){
"use strict";

var BaseOutline = require("./BaseOutline");
var BaseHelper = require("../BaseHelper");
var Box3C = require("../Box3C");
var SizeHelper = require("./SizeHelper");

var ObjectDimensionsHelper = function ObjectDimensionsHelper(options) {
  BaseHelper.call(this);
  var options = options || {};
  var color = this.color = options.color || 0;
  var mesh = options.mesh || this.parent || null;

  this.textBgColor = options.textBgColor !== undefined ? options.textBgColor : "#fff";
  this.textColor = options.textColor !== undefined ? options.textColor : "#000";
  this.labelType = options.labelType !== undefined ? options.labelType : "flat";
  this.sideLength = options.sideLength !== undefined ? options.sideLength : 10;

  this.textBgColor = "#f5f5f5"; //"rgba(255, 255, 255, 0)"
  this.textColor = "#ff0077"; //options.textBgColor;
};

ObjectDimensionsHelper.prototype = Object.create(BaseHelper.prototype);
ObjectDimensionsHelper.prototype.constructor = ObjectDimensionsHelper;

ObjectDimensionsHelper.prototype.attach = function (mesh) {
  var color = this.color;
  var mesh = this.mesh = mesh;
  var lineMat = new THREE.MeshBasicMaterial({ color: color, wireframe: true, shading: THREE.FlatShading });
  /*mesh.updateMatrixWorld();
  var matrixWorld = new THREE.Vector3();
  matrixWorld.setFromMatrixPosition( mesh.matrixWorld );
  this.position.copy( matrixWorld );*/

  var dims = this.getBounds(mesh);
  var length = this.length = dims[0];
  var width = this.width = dims[1];
  var height = this.height = dims[2];

  var delta = this.computeMiddlePoint(mesh);

  //console.log("w",width,"l",length,"h",height,delta);

  var baseCubeGeom = new THREE.BoxGeometry(this.length, this.width, this.height);
  this.meshBoundingBox = new THREE.Mesh(baseCubeGeom, new THREE.MeshBasicMaterial({ wireframe: true, color: 16711680 }));
  //this.add( this.meshBoundingBox )

  this.baseOutline = new BaseOutline(this.length, this.width, delta);
  this.add(this.baseOutline);

  var widthArrowPos = new THREE.Vector3(delta.x + this.length / 2, delta.y, delta.z - this.height / 2);
  var lengthArrowPos = new THREE.Vector3(delta.x, delta.y + this.width / 2, delta.z - this.height / 2);
  var heightArrowPos = new THREE.Vector3(delta.x - this.length / 2, delta.y + this.width / 2, delta.z);
  //console.log("width", this.width, "length", this.length, "height", this.height,"delta",delta, "widthArrowPos", widthArrowPos)
  var sideLength = this.sideLength;

  //length, sideLength, position, direction, color, text, textSize,
  this.widthArrow = new SizeHelper({ length: this.width, sideLength: sideLength,
    direction: new THREE.Vector3(0, 1, 0),
    textBgColor: this.textBgColor, textColor: this.textColor, arrowColor: this.textColor, sideLineColor: this.textColor, labelType: this.labelType });

  this.lengthArrow = new SizeHelper({ length: this.length, sideLength: sideLength,
    direction: new THREE.Vector3(-1, 0, 0),
    textBgColor: this.textBgColor, textColor: this.textColor, arrowColor: this.textColor, sideLineColor: this.textColor, labelType: this.labelType });

  this.heightArrow = new SizeHelper({ length: this.height, sideLength: sideLength,
    direction: new THREE.Vector3(0, 0, 1),
    textBgColor: this.textBgColor, textColor: this.textColor, arrowColor: this.textColor, sideLineColor: this.textColor, labelType: this.labelType });

  this.lengthArrow.position.copy(lengthArrowPos);
  this.widthArrow.position.copy(widthArrowPos);
  this.heightArrow.position.copy(heightArrowPos);

  this.arrows = new THREE.Object3D();
  this.arrows.add(this.widthArrow);
  this.arrows.add(this.lengthArrow);
  this.arrows.add(this.heightArrow);

  this.add(this.arrows);

  this.objectOriginalPosition = this.mesh.position.clone();
  var offsetPosition = this.objectOriginalPosition.clone().sub(new THREE.Vector3(0, 0, this.height / 2));
  this.position.copy(offsetPosition);
};

ObjectDimensionsHelper.prototype.detach = function (mesh) {
  this.mesh = null;
  //this.remove( this.meshBoundingBox );
  this.remove(this.baseOutline);
  this.remove(this.arrows);

  this.objectOriginalPosition = new THREE.Vector3();
  this.position.copy(new THREE.Vector3());
};

ObjectDimensionsHelper.prototype.update = function () {
  //FIXME: VERY costly, needs optimising : is all this needed all the time ?
  var foo = this.mesh.position.clone().sub(this.objectOriginalPosition);
  this.position.add(foo);
  this.objectOriginalPosition = this.mesh.position.clone();

  //check if scale update is needed
  var dims = this.getBounds(this.mesh);
  if (this.length != dims[0] || this.width != dims[1] || this.height != dims[2]) {
    var mesh = this.mesh;
    this.width = dims[1];
    this.length = dims[0];
    this.height = dims[2];

    //update base outline
    this.baseOutline.setLength(this.length);
    this.baseOutline.setWidth(this.width);

    var midPoint = this.computeMiddlePoint(mesh);
    var lengthArrowPos = new THREE.Vector3(midPoint.x, midPoint.y + this.width / 2, midPoint.z - this.height / 2);
    var widthArrowPos = new THREE.Vector3(midPoint.x + this.length / 2, midPoint.y, midPoint.z - this.height / 2);
    var heightArrowPos = new THREE.Vector3(midPoint.x - this.length / 2, midPoint.y + this.width / 2, midPoint.z);

    this.lengthArrow.setLength(this.length);
    this.widthArrow.setLength(this.width);
    this.heightArrow.setLength(this.height);

    this.lengthArrow.position.copy(lengthArrowPos);
    this.widthArrow.position.copy(widthArrowPos);
    this.heightArrow.position.copy(heightArrowPos);

    this.baseOutline.position.z = midPoint.z - this.height / 2;
  }
};

ObjectDimensionsHelper.prototype.computeMiddlePoint = function (mesh) {
  var middle = new THREE.Vector3();
  middle.x = (mesh.boundingBox.max.x + mesh.boundingBox.min.x) / 2;
  middle.y = (mesh.boundingBox.max.y + mesh.boundingBox.min.y) / 2;
  middle.z = (mesh.boundingBox.max.z + mesh.boundingBox.min.z) / 2;
  //console.log("mid",geometry.boundingBox.max.z,geometry.boundingBox.min.z, geometry.boundingBox.max.z+geometry.boundingBox.min.z)
  return middle;
};

ObjectDimensionsHelper.prototype.getBounds = function (mesh) {
  //console.log("gna");
  var bbox = new Box3C().setFromObject(mesh); //new THREE.Box3().setFromObject( mesh );
  //FIXME: needs to ignore any helpers
  //in the hierarchy

  var length = (bbox.max.x - bbox.min.x).toFixed(2) / 1; // division by one to coerce to number
  var width = (bbox.max.y - bbox.min.y).toFixed(2) / 1;
  var height = (bbox.max.z - bbox.min.z).toFixed(2) / 1;

  return [length, width, height];
};

module.exports = ObjectDimensionsHelper;

},{"../BaseHelper":1,"../Box3C":2,"./BaseOutline":5,"./SizeHelper":7}],7:[function(require,module,exports){
"use strict";

var BaseHelper = require("../BaseHelper");

var _require = require("../LabelHelper");

var LabelHelperPlane = _require.LabelHelperPlane;
var LabelHelper3d = _require.LabelHelper3d;

var _require2 = require("../GizmoMaterial");

var GizmoMaterial = _require2.GizmoMaterial;
var GizmoLineMaterial = _require2.GizmoLineMaterial;

/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between star & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/

//TODO: how to put items on the left instead of right, front instead of back etc
var SizeHelper = function SizeHelper(options) {
  BaseHelper.call(this);
  var options = options || {};

  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0;
  //TODO: how to ? would require not using simple lines but strips
  //see ANGLE issue on windows platforms
  this.lineWidth = options.lineWidth !== undefined ? options.lineWidth : 1;

  this.fontSize = options.fontSize !== undefined ? options.fontSize : 10;
  this.textColor = options.textColor !== undefined ? options.textColor : "#000";
  this.textBgColor = options.textBgColor !== undefined ? options.textBgColor : "#fff";
  this.labelPos = options.labelPos !== undefined ? options.labelPos : "center";
  this.labelType = options.labelType !== undefined ? options.labelType : "flat"; //frontFacing or flat
  this.drawLabel = options.drawLabel !== undefined ? options.drawLabel : true;
  this.lengthAsLabel = options.lengthAsLabel !== undefined ? options.lengthAsLabel : true;
  this.textPrefix = options.textPrefix !== undefined ? options.textPrefix : ""; //TODO: perhas a "textformat method would be better ??
  this.labelLength = 0;

  this.drawSideLines = options.drawSideLines !== undefined ? options.drawSideLines : true;
  this.sideLength = options.sideLength !== undefined ? options.sideLength : 0;
  this.sideLengthExtra = options.sideLengthExtra !== undefined ? options.sideLengthExtra : 2;
  this.sideLineColor = options.sideLineColor !== undefined ? options.sideLineColor : 0;
  this.sideLineSide = options.sideLineSide !== undefined ? options.sideLineSide : "front";

  this.drawArrows = options.drawArrows !== undefined ? options.drawArrows : true;
  this.drawLeftArrow = options.drawLeftArrow !== undefined ? options.drawLeftArrow : true;
  this.drawRightArrow = options.drawRightArrow !== undefined ? options.drawRightArrow : true;
  //can be either, dynamic, inside, outside
  this.arrowsPlacement = options.arrowsPlacement !== undefined ? options.arrowsPlacement : "dynamic";
  this.arrowHeadSize = options.arrowHeadSize !== undefined ? options.arrowHeadSize : 2;
  this.arrowHeadWidth = options.arrowHeadWidth !== undefined ? options.arrowHeadWidth : 0.8;

  //this.arrowHeadSize   = 3;
  //this.arrowHeadWidth  = 1;

  //FIXME: temp hack
  this.textBgColor = "rgba(255, 255, 255, 0)";
  //this.arrowColor = options.textColor;
  //FIXME: not sure
  this._userSetText = false;

  this.up = options.up !== undefined ? options.up : new THREE.Vector3(0, 0, 1);
  this._position = options.position !== undefined ? options.position : new THREE.Vector3();
  this.direction = options.direction || new THREE.Vector3(1, 0, 0);

  this.length = options.length !== undefined ? options.length : 10;
  //either use provided length parameter , or compute things based on start/end parameters
  var start = options.start; // !== undefined ? options.start : this._position;
  var end = options.end;

  if (end && start) {
    var tmpV = end.clone().sub(start);
    this.length = tmpV.length();
    this.direction = tmpV.normalize();
    //this._position = start.clone().add( end.clone().sub( start ).divideScalar(2) ) ;
  } else if (start && !end) {
    end = this.direction.clone().multiplyScalar(this.length).add(start);
  } else if (end && !start) {
    start = this.direction.clone().negate().multiplyScalar(this.length).add(end);
  } else {
    start = this.direction.clone().multiplyScalar(-this.length / 2).add(this._position);
    end = this.direction.clone().multiplyScalar(this.length / 2).add(this._position);
  }

  this.start = start;
  this.end = end;
  this.mid = this.direction.clone().multiplyScalar(this.length / 2).add(this.start);

  var textDefault = "";
  if (this.lengthAsLabel) textDefault = this.length.toFixed(2);
  this.text = options.text !== undefined ? options.text : textDefault;

  this.arrowSize = this.length / 2; //size of arrows 
  //HACK, for testing
  if (Math.abs(this.direction.z) - 1 <= 0.0001 && this.direction.x == 0 && this.direction.y == 0) {
    this.up = new THREE.Vector3(1, 0, 0);
  }

  this.leftArrowDir = this.direction.clone();
  this.rightArrowDir = this.leftArrowDir.clone().negate();

  var cross = this.direction.clone().cross(this.up);
  cross.normalize().multiplyScalar(this.sideLength);
  //console.log("mid", this.mid,"cross", cross);

  this.leftArrowPos = this.mid.clone().add(cross);
  this.rightArrowPos = this.mid.clone().add(cross);

  this.flatNormal = cross.clone();

  this.debug = options.debug !== undefined ? options.debug : false;

  this.set();
};

SizeHelper.prototype = Object.create(BaseHelper.prototype);
SizeHelper.prototype.constructor = SizeHelper;

SizeHelper.prototype.set = function () {
  //for debugging only
  if (this.debug) this._drawDebugHelpers();
  this._drawLabel();
  this._drawArrows();
  this._drawSideLines();
};

//setters
SizeHelper.prototype.setUp = function (up) {

  this.up = up !== undefined ? up : new THREE.Vector3(0, 0, 1);
  this._recomputeMidDir();
};

SizeHelper.prototype.setDirection = function (direction) {
  this.direction = direction || new THREE.Vector3(1, 0, 0);

  this._recomputeMidDir();
};

SizeHelper.prototype.setLength = function (length) {
  this.length = length !== undefined ? length : 10;

  this.start = this.direction.clone().multiplyScalar(-this.length / 2).add(this._position);
  this.end = this.direction.clone().multiplyScalar(this.length / 2).add(this._position);

  this._recomputeMidDir();
};

SizeHelper.prototype.setSideLength = function (sideLength) {
  this.sideLength = sideLength !== undefined ? sideLength : 0;

  this._recomputeMidDir();
};

SizeHelper.prototype.setText = function (text) {
  this.text = text !== undefined ? text : "";
  //console.log("setting text to", this.text);
  this._recomputeMidDir();
};

SizeHelper.prototype.setStart = function (start) {

  this.start = start || new THREE.Vector3();

  var tmpV = this.end.clone().sub(this.start);
  this.length = tmpV.length();
  this.direction = tmpV.normalize();

  this._recomputeMidDir();
};

SizeHelper.prototype.setEnd = function (end) {

  this.end = end || new THREE.Vector3();

  var tmpV = this.end.clone().sub(this.start);
  this.length = tmpV.length();
  this.direction = tmpV.normalize();

  this._recomputeMidDir();
};

//helpers
SizeHelper.prototype._recomputeMidDir = function () {

  this.mid = this.direction.clone().multiplyScalar(this.length / 2).add(this.start);

  if (this.lengthAsLabel) {
    this.text = this.textPrefix + this.length.toFixed(2);
  }

  this.arrowSize = this.length / 2; //size of arrows

  this.leftArrowDir = this.direction.clone();
  this.rightArrowDir = this.leftArrowDir.clone().negate();

  //HACK, for up vector issues prevention
  if (Math.abs(this.direction.z) - 1 <= 0.0001 && this.direction.x == 0 && this.direction.y == 0) {
    this.up = new THREE.Vector3(1, 0, 0);
  }

  var cross = this.direction.clone().cross(this.up);
  cross.normalize().multiplyScalar(this.sideLength);
  //console.log("mid", this.mid,"cross", cross);

  if (this.sideLineSide == "back") {
    cross.negate();
  }

  this.leftArrowPos = this.mid.clone().add(cross);
  this.rightArrowPos = this.mid.clone().add(cross);

  this.flatNormal = cross.clone();

  //update label
  this.remove(this.label);
  this._drawLabel();

  //update arrows
  var arrowHeadSize = this.arrowHeadSize;
  var arrowSize = this.arrowSize;

  var leftArrowHeadSize = rightArrowHeadSize = 1e-11;
  var leftArrowHeadWidth = rightArrowHeadWidth = 1e-11;
  if (this.drawLeftArrow) {
    leftArrowHeadSize = arrowHeadSize;leftArrowHeadWidth = this.arrowHeadWidth;
  }
  if (this.drawRightArrow) {
    rightArrowHeadSize = arrowHeadSize;rightArrowHeadWidth = this.arrowHeadWidth;
  }

  this.mainArrowLeft.position.copy(this.leftArrowPos);
  this.mainArrowLeft.setDirection(this.leftArrowDir);
  this.mainArrowLeft.setLength(arrowSize, leftArrowHeadSize, leftArrowHeadWidth);

  this.mainArrowRight.position.copy(this.rightArrowPos);
  this.mainArrowRight.setDirection(this.rightArrowDir);
  this.mainArrowRight.setLength(arrowSize, rightArrowHeadSize, rightArrowHeadWidth);

  this.mainArrowRight.visible = this.drawArrows;
  this.mainArrowLeft.visible = this.drawArrows;

  //update side lines
  //TODO: make truely dynamic
  this.remove(this.rightSideLine);
  this.remove(this.leftSideLine);
  this._drawSideLines();
};

//drawers
SizeHelper.prototype._drawArrows = function () {
  var sideLength = this.sideLength;

  var leftArrowDir = this.leftArrowDir;
  var rightArrowDir = this.rightArrowDir;
  var leftArrowPos = this.leftArrowPos;
  var rightArrowPos = this.rightArrowPos;

  var arrowHeadSize = this.arrowHeadSize;
  var arrowSize = this.arrowSize;

  var rightArrowHeadSize = undefined;
  var rightArrowHeadWidth = undefined;

  var leftArrowHeadSize = rightArrowHeadSize = 1e-11;
  var leftArrowHeadWidth = rightArrowHeadWidth = 1e-11;
  if (this.drawLeftArrow) {
    leftArrowHeadSize = arrowHeadSize;leftArrowHeadWidth = this.arrowHeadWidth;
  }
  if (this.drawRightArrow) {
    rightArrowHeadSize = arrowHeadSize;rightArrowHeadWidth = this.arrowHeadWidth;
  }

  //direction, origin, length, color, headLength, headRadius, headColor
  var mainArrowLeft = new THREE.ArrowHelper(leftArrowDir, leftArrowPos, arrowSize, this.arrowColor, leftArrowHeadSize, leftArrowHeadWidth);
  var mainArrowRight = new THREE.ArrowHelper(rightArrowDir, rightArrowPos, arrowSize, this.arrowColor, rightArrowHeadSize, rightArrowHeadWidth);
  mainArrowLeft.scale.z = 0.6;
  mainArrowRight.scale.z = 0.6;
  this.add(mainArrowLeft);
  this.add(mainArrowRight);

  //material settings : FIXME, move this elsewhere
  this.arrowLineMaterial = new GizmoLineMaterial({ color: this.arrowColor, linewidth: this.lineWidth, linecap: "miter" });
  this.arrowConeMaterial = new GizmoMaterial({ color: this.arrowColor });

  mainArrowRight.line.material = mainArrowLeft.line.material = this.arrowLineMaterial;
  mainArrowRight.cone.material = mainArrowLeft.cone.material = this.arrowConeMaterial;

  mainArrowRight.renderDepth = mainArrowLeft.renderDepth = 100000000000000000000;
  mainArrowRight.depthTest = mainArrowLeft.depthTest = true;
  mainArrowRight.depthWrite = mainArrowLeft.depthWrite = true;

  this.mainArrowRight = mainArrowRight;
  this.mainArrowLeft = mainArrowLeft;
};

/*determine positioning for the label/text:
  Different cases:
   - arrows pointing inwards:
    * if label + arrows fits between ends, put label between arrows
    * if label does not fit between ends
  
*/
SizeHelper.prototype._drawLabel = function () {
  var sideLength = this.sideLength;
  var length = this.length;

  //draw dimention / text
  //this first one is used to get some labeling metrics, and is
  //not always displayed
  this.label = new LabelHelperPlane({ text: this.text, fontSize: this.fontSize, color: this.textColor, bgColor: this.textBgColor });
  this.label.position.copy(this.leftArrowPos);

  //this.label.setRotationFromAxisAngle(this.direction.clone().normalize(), angle);
  //console.log("dir,angl",this.direction, angle, this.label.up);

  var labelDefaultOrientation = new THREE.Vector3(-1, 0, 0);

  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(labelDefaultOrientation, this.direction.clone());
  this.label.rotation.setFromQuaternion(quaternion);
  this.label.rotation.z += Math.PI;

  var labelWidth = this.label.textWidth;
  var reqWith = labelWidth + 1 * this.arrowHeadSize;
  this.labelLength = labelWidth;

  switch (this.labelType) {
    case "flat":
      /*this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize, color:this.textColor, background:(this.textBgColor!=null),bgColor:this.textBgColor});*/
      break;
    case "frontFacing":
      this.label = new LabelHelper3d({ text: this.text, fontSize: this.fontSize, color: this.textColor, bgColor: this.textBgColor });
      break;
  }
  this.label.position.copy(this.leftArrowPos);
  //this.label.rotation.z = Math.PI;

  //calculate offset so that there is a hole between the two arrows to draw the label
  //arrowSize -= 10;
  //TODO: only needed when drawing label
  var labelHoleExtra = 0.5;
  var labelHoleHalfSize = (this.labelLength + labelHoleExtra) / 2;

  if (this.drawLabel) this.add(this.label);

  if (this.arrowsPlacement == "dynamic") {
    if (reqWith > this.length) //if the label + arrows would not fit
      {
        this.arrowSize = Math.max(length / 2, 6); //we want arrows to be more than just arrowhead in all the cases
        var arrowXPos = this.length / 2 + this.arrowSize;

        this.leftArrowDir = this.direction.clone().negate();
        this.rightArrowDir = this.leftArrowDir.clone().negate();

        this.leftArrowPos.sub(this.leftArrowDir.clone().normalize().multiplyScalar(arrowXPos));
        this.rightArrowPos.sub(this.rightArrowDir.clone().normalize().multiplyScalar(arrowXPos));

        if (labelWidth > this.length) //if even the label itself does not fit
          {
            this.label.position.y -= 5;
            //this.label.position.add( this.direction.clone().multiplyScalar( 5 ) );
          }
      } else {
      //if the label + arrows would fit
      this.arrowSize -= labelHoleHalfSize;
      this.leftArrowPos.add(this.leftArrowDir.clone().normalize().setLength(labelHoleHalfSize));
      this.rightArrowPos.add(this.rightArrowDir.clone().normalize().setLength(labelHoleHalfSize));
    }
  } else if (this.arrowsPlacement == "outside") {
    //put the arrows outside of measure, pointing "inwards" towards center
    this.arrowSize = Math.max(length / 2, 6); //we want arrows to be more than just arrowhead in all the cases
    var arrowXPos = this.length / 2 + this.arrowSize;

    this.leftArrowDir = this.direction.clone().negate();
    this.rightArrowDir = this.leftArrowDir.clone().negate();

    this.leftArrowPos.sub(this.leftArrowDir.clone().normalize().multiplyScalar(arrowXPos));
    this.rightArrowPos.sub(this.rightArrowDir.clone().normalize().multiplyScalar(arrowXPos));
  } else {
    this.arrowSize -= labelHoleHalfSize;
    this.leftArrowPos.add(this.leftArrowDir.clone().normalize().setLength(labelHoleHalfSize));
    this.rightArrowPos.add(this.rightArrowDir.clone().normalize().setLength(labelHoleHalfSize));
  }
};

SizeHelper.prototype._drawSideLines = function () {
  if (this.drawSideLines) {
    var sideLength = this.sideLength;
    var sideLengthExtra = this.sideLengthExtra;

    var sideLineGeometry = new THREE.Geometry();
    var sideLineStart = this.start.clone();
    var sideLineEnd = sideLineStart.clone().add(this.flatNormal.clone().normalize().multiplyScalar(sideLength + sideLengthExtra));

    sideLineGeometry.vertices.push(sideLineStart);
    sideLineGeometry.vertices.push(sideLineEnd);

    var material = new GizmoLineMaterial({ color: this.sideLineColor, opacity: 0.4, transparent: true });
    //depthTest:false, depthWrite:false,renderDepth : 1e20
    var leftSideLine = new THREE.Line(sideLineGeometry, material);

    var leftToRightOffset = this.end.clone().sub(this.start);

    var rightSideLine = leftSideLine.clone();
    rightSideLine.position.add(leftToRightOffset);

    this.rightSideLine = rightSideLine;
    this.leftSideLine = leftSideLine;

    this.add(rightSideLine);
    this.add(leftSideLine);
  }
};

SizeHelper.prototype._drawDebugHelpers = function () {
  if (this.debugHelpers) this.remove(this.debugHelpers);

  this.debugHelpers = new THREE.Object3D();
  var directionHelper = new THREE.ArrowHelper(this.direction.clone().normalize(), this.start, 15, 16711680);
  var startHelper = new CrossHelper({ position: this.start, color: 16711680 });
  var midHelper = new CrossHelper({ position: this.mid, color: 255 });
  var endHelper = new CrossHelper({ position: this.end, color: 65280 });

  this.debugHelpers.add(directionHelper);
  this.debugHelpers.add(startHelper);
  this.debugHelpers.add(midHelper);
  this.debugHelpers.add(endHelper);

  this.add(this.debugHelpers);
};

module.exports = SizeHelper;

},{"../BaseHelper":1,"../GizmoMaterial":3,"../LabelHelper":4}],8:[function(require,module,exports){
"use strict";

var ObjectDimensions = require("./DimensionsHelper.js");

module.exports = ObjectDimensions;

},{"./DimensionsHelper.js":6}]},{},[8])(8)
});