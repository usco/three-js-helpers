/*Base class*/
//TODO: correctly map ogl units to fontSize to canvasSize etc
LabelHelper = function (options) {
  BaseHelper.call( this );

  var options = options || {};
  this.text       = options.text !== undefined ? options.text : " ";
  this.color      = options.color || "rgba(0, 0, 0, 1)";
  
  //this.textColor  = options.textColor !== undefined ? options.textColor : "rgba(0, 0, 0, 1)";
  this.fontFace   = options.fontFace || "Jura"; 
  this.fontWeight = options.fontWeight || "bold";//"normal bolder";
  this.fontSize   = options.fontSize || 10;
  this.fontStyle  = "";
  this.background = options.background !== undefined ? options.background : true;

  this.bgColor    = options.bgColor || "rgba(255, 255, 255, 1)";
  
  this._resolutionMultiplier = 8;
  this._alphaTest = 0.1;
  
  this.borderSize = 0;
  this.width  = 0;
  this.height = 0;
  
  
  //texture upscaling ratio
  this.upscale = 10;
  
  //convertion of canvas to webglUnits 
  this.baseRatio = 4; 

  this.canvas = document.createElement('canvas');
  this.canvas.style.position = "absolute";
  this.canvas.width  = 256;
  this.canvas.height = 256;
  
  this.context= this.canvas.getContext('2d');
  
  var texture	= new THREE.Texture(this.canvas);
	this.texture	= texture;
  
  this.measureText();
  this.drawText();
}

LabelHelper.prototype = Object.create( BaseHelper.prototype );
LabelHelper.prototype.constructor = LabelHelper;

LabelHelper.prototype.setText = function( text ){
  this.text = text;
  this.generateTextFromCanvas();
  this.generate();
}

LabelHelper.prototype.applyFontStyleToContext = function( measureMode ){
  var measureMode = measureMode!== undefined ? measureMode : true;
  
  var fontSize = this.charHeight;
  if(!measureMode) fontSize = this.scaledFontSize;
  
  var font = this.fontWeight +" "+ this.fontStyle +" " + fontSize +"px "+ this.fontFace;

  this.context.font = font;
  this.context.textBaseline = "middle"; 
  this.context.textAlign    = "center"
}

LabelHelper.prototype.measureText = function( text ){

  var pixelRatio = window.devicePixelRatio || 1;
  var charWidth   = 0;
  var charHeight  = pixelRatio * this.fontSize;
  
  var canvas     = this.canvas;
  var context    = this.context;
  var fontFace   = this.fontFace;
  var fontWeight = this.fontWeight;
  var fontStyle  = this.fontStyle;
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
	  while(pow<value) {
		  pow *= 2;
	  }
	  return pow;
  }
  
  //FIXME: hackery based on measurement of specific characters 
  charWidth = context.measureText(  Array(100+1).join('M') ).width / 100;
  this.charWidth  = charWidth;
  this.charHeight = charHeight;
  
  var charWidth = (context.measureText(  Array(100+1).join('M') ).width ) / 100;
  var charHeight = this.fontSize; 

  var rWidth  = charWidth * (this.text.length-1);
  var rHeight = charHeight;
  var textWidth = context.measureText(text).width;
  var sqrWidth  = getPowerOfTwo(textWidth);
  var sqrHeight = getPowerOfTwo(2*this.fontSize);
  
  var upscale   = this.upscale; 
  var baseRatio = this.baseRatio; 
  
  sqrWidth  *= upscale;
  sqrHeight *= upscale;
  
  this.canvasWidth     = sqrWidth;
  this.canvasHeight    = sqrHeight;
  
  this.width = sqrWidth/(upscale*baseRatio);
  this.height = sqrHeight/(upscale*baseRatio);
  
  this.scaledFontSize = this.fontSize * upscale;
  
  this.textWidth  = (textWidth*upscale)/(upscale*baseRatio);
  this.textHeight = (rHeight*upscale)/(upscale*baseRatio);
  
  //this.width      = ( charWidth * this.text.length-1 ) * this.canvasGLRatio + borderSize*2;
  //this.height     = charHeight * this.canvasGLRatio + borderSize*2;
  
  console.log("canvas",sqrWidth, sqrHeight,"Width/height",this.width,this.height,"text (glSizes)",this.textWidth,this.textHeight);
  
}


LabelHelper.prototype.drawText = function()
{
  var canvas  = this.canvas;
  var context = this.context;
  var text    = this.text;
  
  var color = this.color;
  
  var fontWeight = this.fontWeight;
  var fontStyle  = this.fontStyle;
  var fontFace   = this.fontFace;
  var charHeight = this.charHeight;
  
  canvas.width = this.canvasWidth;
  canvas.height = this.canvasHeight;
  
  this.applyFontStyleToContext( false );
  
  context.clearRect(0, 0, canvas.width, canvas.height);

  //context.fillStyle = "#000000";
  //context.fillRect(0, 0, canvas.width, canvas.height); 
  
  context.fillStyle = "#ffffff";
  context.fillText(text, canvas.width/2, canvas.height/2);
  
  //textWidth
  //ctx.strokeStyle="red";
  //ctx.rect((canvas.width-rWidth)/2,(canvas.height-rHeight)/2,rWidth,rHeight);
  //ctx.stroke();

  
  texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  
  console.log("texture", texture);
  
  //texture.magFilter = THREE.NearestFilter;
  //texture.minFilter = THREE.LinearMipMapLinearFilter;
  
  this._texture = texture;

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
  
  //color= "rgba(1, 1, 1, 1)";
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
    color: this.color ,
    side : THREE.DoubleSide,
    //depthTest:false,
    //depthWrite:false,
    //renderDepth : 1e20
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
  
  var width  = this.width;
  var height = this.height;
  
  //width = this.canvasWidth;
  //height = this.canvasHeight;
  console.log("width", width,"height", height);

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
    side : THREE.FrontSide,
    shading: THREE.FlatShading,
  });
  
   /*depthTest:false,
    depthWrite:false,
    renderDepth : 1e20,*/
  
  var textPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);
  
  if( this.textMesh ) this.remove( this.textMesh );

  this.textMesh = textPlane;
  this.add( textPlane );
  
  if( this.textPlaneBack ) this.remove( this.textPlaneBack );
  
  this.textPlaneBack = textPlane.clone();
  this.textPlaneBack.rotation.y = -Math.PI;
  this.add( this.textPlaneBack );
  
  
};
