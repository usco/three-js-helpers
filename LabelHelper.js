/*Base class*/
//TODO: correctly map ogl units to fontSize to canvasSize etc
LabelHelper = function (options) {
  BaseHelper.call( this );

  var options = options || {};
  this.text = options.text !== undefined ? options.text : " ";
  this.color = options.color || "rgba(0, 0, 0, 1)";
  this.fontFace = options.fontFace || "Jura"; 
  this.fontWeight = options.fontWeight || "normal bolder";
  this.fontSize = options.fontSize || 13;
  this.background = options.background !== undefined ? options.background : true;

  this.bgColor = options.bgColor || "rgba(255, 255, 255, 1)";
  
  this._resolutionMultiplier = 8;
  this._alphaTest = 0.1;
  
  this.width = 0;
  this.height = this.fontSize/4;
  
  this.generateTextFromCanvas();
}

LabelHelper.prototype = Object.create( BaseHelper.prototype );
LabelHelper.prototype.constructor = LabelHelper;

LabelHelper.prototype.generateTextFromCanvas = function()
{
  var canvas, context, material, plane, texture;
  var fontFace = this.fontFace;
  var fontWeight = this.fontWeight;
  var fontSize = this.fontSize;
  var text = this.text;
  var color = this.color;
  var background = this.background;
  var bgColor = this.bgColor;
  var borderThickness = 1;
  
  //for background drawing
  var bgRect = function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    return ctx.stroke();
  };
  
  canvas = document.createElement('canvas');
  context = canvas.getContext('2d');
  context.font = fontWeight +" "+ fontSize+"px "+fontFace;
  context.textAlign = 'center';

  var metrics = context.measureText(text);
  var resMult = this._resolutionMultiplier;
  canvas.height = this.fontSize  * resMult;
  canvas.width = metrics.width * resMult;
  context.font = fontWeight +" "+ (fontSize*resMult)+"px "+fontFace;
  context.textAlign = 'center';
  
  this.width = metrics.width/4;
  
  if (background) {
    var upscaledFontSize = fontSize * resMult;
    var textWidth = context.measureText(text).width*resMult;
    context.fillStyle = bgColor;
    context.strokeStyle = bgColor;
    bgRect(context, canvas.width / 2 - upscaledFontSize -10, canvas.height / 2 - upscaledFontSize, textWidth + borderThickness, upscaledFontSize * 1.4 + borderThickness, 0);
  }
  
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 1.3);
  context.lineWidth = 3;
  context.strokeStyle = color;
  context.strokeText(text, canvas.width / 2, canvas.height / 1.3);
  
  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  
  this._texture = texture;
}

/*Perspective 3d helpers*/
LabelHelper3d = function(options)
{
  LabelHelper.call( this, options );
  this.generate();
}

LabelHelper3d.prototype = Object.create( LabelHelper.prototype );
LabelHelper3d.prototype.constructor = LabelHelper3d;

LabelHelper3d.prototype.generate = function() {
  var spriteMaterial = new THREE.SpriteMaterial({
    map: this._texture,
    transparent: true,
    alphaTest: this._alphaTest,
    useScreenCoordinates: false,
    scaleByViewport: false,
    color: 0xffffff,
    side : THREE.DoubleSide,
    depthTest:false,
    depthWrite:false,
    renderDepth : 1e20
  });
  
  var width = this.width;
  var height = this.height;

  var textSprite = new THREE.Sprite(spriteMaterial);
  textSprite.scale.set( width, height, 1.0);
  
  this.textSprite = textSprite;
  this.add( textSprite );
  
  //var testCube = new THREE.Mesh(new THREE.CubeGeometry(width, height,  0.1), new THREE.MeshBasicMaterial({color:0xFF0000}));
  //this.add( testCube );
};


/*Flat (perspective not front facing) helper*/
LabelHelperPlane = function(options)
{
  LabelHelper.call( this, options );
  this.generate(options);
}

LabelHelperPlane.prototype = Object.create( LabelHelper.prototype );
LabelHelperPlane.prototype.constructor = LabelHelperPlane;

LabelHelperPlane.prototype.generate = function() {
  var material = new THREE.MeshBasicMaterial({
    map: this._texture,
    transparent: true,
    color: 0xffffff,
    alphaTest: this._alphaTest,
    side : THREE.DoubleSide,
    depthTest:false,
    depthWrite:false,
    renderDepth : 1e20,
  });
  
  var width = this.width;
  var height = this.height;
  
  var textPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);
  textPlane.renderDepth =1e20;
  
  this.textMesh = textPlane;
  this.add( textPlane );
  
  //var testCube = new THREE.Mesh(new THREE.CubeGeometry(width, height,  0.1), new THREE.MeshBasicMaterial({color:0xFF0000}));
  //this.add( testCube );
};
