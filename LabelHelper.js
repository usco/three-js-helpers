/*Base class*/
//TODO: correctly map ogl units to fontSize to canvasSize etc
LabelHelper = function (options) {
  BaseHelper.call( this );

  var options = options || {};
  this.text       = options.text !== undefined ? options.text : " ";
  this.color      = options.color || "rgba(0, 0, 0, 1)";
  this.fontFace   = options.fontFace || "Jura"; 
  this.fontWeight = options.fontWeight || "bold";//"normal bolder";
  this.fontSize   = options.fontSize || 10;
  this.background = options.background !== undefined ? options.background : true;

  this.bgColor    = options.bgColor || "rgba(255, 255, 255, 1)";
  
  this._resolutionMultiplier = 8;
  this._alphaTest = 0.1;
  
  this.width = 0;
  this.height = this.fontSize/4;
  
  this.generateTextFromCanvas();
}

LabelHelper.prototype = Object.create( BaseHelper.prototype );
LabelHelper.prototype.constructor = LabelHelper;

LabelHelper.prototype.setText = function( text ){
  this.text = text;
  this.generateTextFromCanvas();
  this.generate();
}







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
  
  //var spriteAlignment = THREE.SpriteAlignment.topLeft;
  
  //for background drawing
  var bgRect = function(ctx, x, y, w, h) {
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
  function roundRect(ctx, x, y, w, h, r) 
  {
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.lineTo(x+w-r, y);
      ctx.quadraticCurveTo(x+w, y, x+w, y+r);
      ctx.lineTo(x+w, y+h-r);
      ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      ctx.lineTo(x+r, y+h);
      ctx.quadraticCurveTo(x, y+h, x, y+h-r);
      ctx.lineTo(x, y+r);
      ctx.quadraticCurveTo(x, y, x+r, y);
      ctx.closePath();
      ctx.fill();
	    ctx.stroke();   
  }
  
  //this forces a higher resolution (for texts)
  var resMult = this._resolutionMultiplier;
  var borderSize = 5;
  //background = false;
  
  canvas = document.createElement('canvas');
  //  canvas.width = 340;
  context = canvas.getContext('2d');
  context.save();
  
  var rawFont = fontWeight + " " + (fontSize* resMult * 1.5) +"px "+fontFace;
  context.font = rawFont;
  context.textBaseline = "top"; 
  context.textAlign    = "center";
  
  var metrics = context.measureText(text);
  var width  = metrics.width ;
  var height = fontSize  * resMult * 1.5 + borderSize;
  
  var fullWidth  = width  + borderSize*2;
  var fullHeight = height + borderSize*2;

  //console.log(" width",canvas.width, fullWidth);

  //console.log(" width", width, "height", height,metrics.width, fontSize,resMult,context.font, rawFont );
  this.width  = (fullWidth)/resMult/4;
  this.height = (fullHeight)/resMult/4;
  
  if (background){
    context.fillStyle   = bgColor;
    context.strokeStyle = bgColor;
    context.fillRect(0, 0, fullWidth, fullHeight);
  }

  context.scale(0.9, 0.9);
  context.fillStyle = color;
  context.fillText(text, width/2+borderSize/2,0 )//width/2, height/2);
  //context.lineWidth = 3;
  context.strokeStyle = color;
  context.strokeText(text, width/2+borderSize/2 ,0);
  context.restore();
  
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
  this.generate();
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
  
  if( this.textMesh ) this.remove( this.textMesh );
  
  this.textMesh = textPlane;
  this.add( textPlane );
};
