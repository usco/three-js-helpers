
/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between star & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/

//TODO: how to put items on the left instead of right, front instead of back etc
SizeHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  this.linesColor = options.linesColor !== undefined ? options.linesColor : 0x000000;
  //TODO: how to ? would require not using simple lines but strips
  //see ANGLE issue on windows platforms
  this.lineWidth  = options.lineWidth !== undefined ? options.lineWidth : 1;
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  
  this.drawSideLines = options.drawSideLines!== undefined ? options.drawSideLines :true;
  this.sideLength    = options.sideLength!== undefined ? options.sideLength : 3; 
  this.sideLengthExtra = options.sideLength!== undefined ? options.sideLength : 2; 
  
  this.drawLeftArrow   = options.drawLeftArrow !== undefined ? options.drawLeftArrow: true  ;
  this.drawRightArrow  = options.drawRightArrow !== undefined ? options.drawRightArrow : true;
  //can be either, dynamic, inside, outside
  this.arrowsPlacement = options.arrowsPlacement!== undefined ? options.arrowsPlacement : 'dynamic';
  this.arrowHeadSize   = 4;
  
  
  //this.start = start;
  //this.end = end;
  this.up       = options.up !== undefined ? options.up : new THREE.Vector3(0,0,1);
  this._position= options.position !== undefined ? options.position : new THREE.Vector3();
  this.direction= options.direction || new THREE.Vector3(1,0,0);
  
  this.length = options.length !== undefined ? options.length : 10;
  //either use provided length parameter , or compute things based on start/end parameters
  var start = options.start || this.position;
  var end = options.end ;
  console.log("foo");
  if(end && start)
  {
    var tmpV = end.clone().sub( start ) ;
    this.length = tmpV.length();
    //console.log("start",start,"end", end);
    this.direction = tmpV.normalize();
    console.log("computed length", this.length, "dir", this.direction);
    this._position = start.clone().add( end.clone().sub( start ).divideScalar(2) ) ;
  }
  this.text   = options.text !== undefined ? options.text : this.length.toFixed(2);
  
  
  this.arrowSize = this.length/2;//size of arrows, including their head
  
  
  this.leftArrowDir = new THREE.Vector3( 1,0,0 );
  this.rightArrowDir = new THREE.Vector3( -1,0,0 );
  this.leftArrowPos = new THREE.Vector3( 0, this.sideLength,0 );
  this.rightArrowPos = new THREE.Vector3( 0, this.sideLength,0 );
}

SizeHelper.prototype = Object.create( BaseHelper.prototype );
SizeHelper.prototype.constructor = SizeHelper;

SizeHelper.prototype.set = function(options){
  var options = options || {};
  //this._position= options.position !== undefined ? options.position : new THREE.Vector3();

  this._drawLabel();
  this._drawArrows();
  this._drawSideLines();
  
  this.position.copy( this._position );
}

SizeHelper.prototype._drawArrows = function(){
  var sideLength = this.sideLength;
  var length     = this.length;
  var direction  = this.direction;
  
  var leftArrowDir = this.leftArrowDir;
  var rightArrowDir = this.rightArrowDir 
  var leftArrowPos = this.leftArrowPos;
  var rightArrowPos= this.rightArrowPos;
  
  var arrowHeadSize = this.arrowHeadSize;
  var arrowSize     = this.arrowSize; 
  
    
  var leftArrowHeadSize = rightArrowHeadSize = 0;
  if(this.drawLeftArrow) leftArrowHeadSize = arrowHeadSize;
  if(this.drawRightArrow) rightArrowHeadSize = arrowHeadSize;
  
  //direction, origin, length, color, headLength, headRadius, headColor
  var mainArrowLeft = new THREE.ArrowHelper(leftArrowDir,leftArrowPos,arrowSize, this.arrowColor,leftArrowHeadSize, 2);
  var mainArrowRight = new THREE.ArrowHelper(rightArrowDir,rightArrowPos,arrowSize, this.arrowColor,rightArrowHeadSize, 2);
  mainArrowLeft.scale.z =0.1;
  mainArrowRight.scale.z=0.1;
  
  this.add( mainArrowLeft );
  this.add( mainArrowRight );
  
  //general attributes
  var angle = new THREE.Vector3(1,0,0).angleTo(direction);
  this.setRotationFromAxisAngle(direction, angle);

  //material settings : FIXME, move this elsewhere
  this.arrowLineMaterial = new THREE.LineBasicMaterial({color:this.arrowColor, linewidth:this.lineWidth,linecap:"miter",depthTest:false,depthWrite:false});
  this.arrowConeMaterial = new THREE.MeshBasicMaterial({color:this.arrowColor, 
depthTest:false, depthWrite:false});
  
  mainArrowRight.line.material = mainArrowLeft.line.material = this.arrowLineMaterial;
  mainArrowRight.cone.material = mainArrowLeft.cone.material = this.arrowConeMaterial;
  mainArrowRight.renderDepth = mainArrowLeft.renderDepth = 1e20;
}

SizeHelper.prototype._drawLabel = function(){
  var sideLength = this.sideLength;
  var length = this.length;

  //draw dimention / text
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
  this.label.position.y = sideLength;
  this.label.rotation.z = Math.PI;
  
  var labelWidth = this.label.width;
  var reqWith = labelWidth + 2 * this.arrowHeadSize;
  
  this.label = new LabelHelper3d({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
  this.label.position.y = sideLength;
  this.label.rotation.z = Math.PI;
  this.add( this.label );
  
  if( this.arrowsPlacement == "dynamic" )
  {
    if(reqWith>this.length)//if the label + arrows would not fit
    {
      this.arrowSize = Math.max( this.length/2, 6 );//we want arrows to be more than just arrowhead in all the cases
      var arrowXPos  = this.length/2 +this.arrowSize;
    
      this.leftArrowDir  = new THREE.Vector3( -1,0,0 );//reverse orientation of arrows
      this.rightArrowDir = new THREE.Vector3( 1,0,0 );
      this.leftArrowPos  = new THREE.Vector3( arrowXPos, sideLength, 0 );
      this.rightArrowPos = new THREE.Vector3( -arrowXPos, sideLength, 0 );
      if( labelWidth > this.length)//if even the label itself does not fit
      {
        this.label.position.y += 5;
      }
    }
  }else if( this.arrowsPlacement == "outside" ){
    this.arrowSize = Math.max(length/2,6);//we want arrows to be more than just arrowhead in all the cases
    var arrowXPos = this.length/2 + this.arrowSize;
  
    this.leftArrowDir  = new THREE.Vector3( -1, 0, 0 );//reverse orientation of arrows
    this.rightArrowDir = new THREE.Vector3( 1, 0, 0 );
    this.leftArrowPos  = new THREE.Vector3( arrowXPos, sideLength, 0 );
    this.rightArrowPos = new THREE.Vector3( -arrowXPos, sideLength, 0 );
  
  }
  
}

SizeHelper.prototype._drawSideLines = function(){
  if( this.drawSideLines )
  {
    var sideLength = this.sideLength;
    var sideLengthExtra = this.sideLengthExtra;
    
    var sideLineGeometry = new THREE.Geometry();
    sideLineGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    sideLineGeometry.vertices.push( new THREE.Vector3( 0, sideLength+sideLengthExtra , 0 ) );
    
    var leftSideLine = new THREE.Line( sideLineGeometry, new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } ) );
    leftSideLine.position.x = -this.length / 2 ;

    var rightSideLine = leftSideLine.clone();
    rightSideLine.position.x = this.length / 2;
    
    this.add( rightSideLine );
    this.add( leftSideLine );
  }
}
