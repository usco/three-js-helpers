var BaseHelper = require("./BaseHelper");

class LabelHelper extends BaseHelper {
  constructor( options ) {
    const DEFAULTS = {
      text: "",
      color:"rgba(0, 0, 0, 1)",
      bgColor: "rgba(255, 255, 255, 1)",
      background: true,
      fontSize: 10,
      fontFace: "Jura",
      fontWeight: "bold",
      fontStyle: "",

      borderSize:0,
      alphaTest:0.1,
      upscale : 10,//texture upscaling ratio
      baseRatio:4, //convertion of canvas to webglUnits 
    };
    
    let options = Object.assign({}, DEFAULTS, options); 
    
    super( options ); 
    
    Object.assign(this, options);
    
    console.log("options", options);
    this.width  = 0;
    this.height = 0;
    
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
  
  
  clear( ){
    this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    this._texture.needsUpdate	= true;
  }
  
  setText( text ){
    this.text = text;
    this.generate();
  }
  
  applyFontStyleToContext( measureMode ){
    var measureMode = measureMode!== undefined ? measureMode : true;
    
    var fontSize = this.charHeight;
    if(!measureMode) fontSize = this.scaledFontSize;
    
    var font = this.fontWeight +" "+ this.fontStyle +" " + fontSize +"px "+ this.fontFace;

    this.context.font = font;
    this.context.textBaseline = "middle"; 
    this.context.textAlign    = "center"
  }
  
  measureText( text ){
    var pixelRatio = window.devicePixelRatio || 1;
    var charWidth   = 0;
    var charHeight  = pixelRatio * this.fontSize;
    
    var canvas     = this.canvas;
    var context    = this.context;
    var fontFace   = this.fontFace;
    var fontWeight = this.fontWeight;
    var fontStyle  = this.fontStyle;
    var borderSize = this.borderSize;
    
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
    
    console.log("canvas",sqrWidth, sqrHeight,"Width/height",this.width,this.height,"text (glSizes)",this.textWidth,this.textHeight);
  }
  
  drawText()
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
    
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    this._texture = texture;
  }

}


/*Perspective 3d helpers*/
class LabelHelper3d extends LabelHelper {
  constructor( options ) {
    const DEFAULTS = {
    };

    let options = Object.assign({}, DEFAULTS, options); 
    super( options );    
    Object.assign(this, options);
    
    this.generate();
  }
  
  generate( ){
    var spriteMaterial = new THREE.SpriteMaterial({
      map: this._texture,
      transparent: true,
      alphaTest: this.alphaTest,
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
  }
}
  



/*Flat (perspective not front facing) helper*/
class LabelHelperPlane extends LabelHelper {
  constructor( options ) {
    const DEFAULTS = {
    };
    let options = Object.assign({}, DEFAULTS, options); 
    super( options );    
    
    Object.assign(this, options);
    console.log("this", this, options);
    
    this.generate();
   }
   
  generate(){
    var width  = this.width;
    var height = this.height;
    //console.log("width", width,"height", height);
    console.log("gn",this);

    var material = new GizmoMaterial({
      map: this._texture,
      transparent: true,
      color: this.color,
      alphaTest: this.alphaTest,
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
   }
}

module.exports = {LabelHelperPlane:LabelHelperPlane,LabelHelper3d:LabelHelper3d}; 
