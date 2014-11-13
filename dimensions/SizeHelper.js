
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
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.drawSideLines = options.drawSideLines!== undefined ? options.drawSideLines :true;
  this.sideLength    = options.sideLength!== undefined ? options.sideLength : 0; 
  this.sideLengthExtra = options.sideLengthExtra!== undefined ? options.sideLengthExtra : 2; 
  
  this.drawLeftArrow   = options.drawLeftArrow !== undefined ? options.drawLeftArrow: true  ;
  this.drawRightArrow  = options.drawRightArrow !== undefined ? options.drawRightArrow : true;
  //can be either, dynamic, inside, outside
  this.arrowsPlacement = options.arrowsPlacement!== undefined ? options.arrowsPlacement : 'dynamic';
  this.arrowHeadSize   = 4;
  this.arrowHeadWidth  = 1;
  
  
  //this.start = start;
  //this.end = end;
  this.up       = options.up !== undefined ? options.up : new THREE.Vector3(0,0,1);
  this._position= options.position !== undefined ? options.position : new THREE.Vector3();
  this.direction= options.direction || new THREE.Vector3(1,0,0);
  
  this.length = options.length !== undefined ? options.length : 10;
  //either use provided length parameter , or compute things based on start/end parameters
  var start   = options.start;// !== undefined ? options.start : this._position;
  var end     = options.end ;
  
  if(end && start)
  {
    var tmpV = end.clone().sub( start ) ;
    this.length = tmpV.length();
    //console.log("start",start,"end", end);
    this.direction = tmpV.normalize();
    console.log("computed length", this.length, "dir", this.direction);
    //this._position = start.clone().add( end.clone().sub( start ).divideScalar(2) ) ;
  }else if(start && !end){
    end = this.direction.clone().multiplyScalar( this.length ).add( start );
  }
  else if(end && !start){
    start = this.direction.clone().negate().multiplyScalar( this.length ).add( end );
  }else
  {
    start = this.direction.clone().multiplyScalar( -this.length/2).add( this._position );
    end   = this.direction.clone().multiplyScalar( this.length/2).add( this._position );
  }
  
  this.start = start;
  this.end   = end;
  this.mid   = this.direction.clone().multiplyScalar( this.length/2 ).add( this.start );
  
  this.text   = options.text !== undefined ? options.text : this.length.toFixed(2);
  
  this.arrowSize = this.length/2;//size of arrows  
  //HACK, for testing
  if( ( (Math.abs( this.direction.z) - 1) <= 0.0001) && this.direction.x == 0 && this.direction.y ==0 )
  {
    this.up = new THREE.Vector3( 1,0, 0 );
  }
  
  this.leftArrowDir = this.direction.clone();
  this.rightArrowDir = this.leftArrowDir.clone().negate();
  var cross = this.direction.clone().cross( this.up );
  cross.normalize().multiplyScalar(this.sideLength);
  //console.log("mid", this.mid,"cross", cross);
  this.leftArrowPos = this.mid.clone().add( cross );
  this.rightArrowPos = this.mid.clone().add( cross );
  
  this.flatNormal = cross.clone();
  
  this.debug = options.debug !== undefined ? options.debug : false;
}

SizeHelper.prototype = Object.create( BaseHelper.prototype );
SizeHelper.prototype.constructor = SizeHelper;

SizeHelper.prototype.set = function(options){
  var options = options || {};
  //this._position= options.position !== undefined ? options.position : new THREE.Vector3();

  //for debugging only
  if(this.debug) this._drawDebugHelpers();

  this._drawLabel();
  this._drawArrows();
  this._drawSideLines();
  
}

SizeHelper.prototype._drawArrows = function(){
  var sideLength = this.sideLength;
  var length     = this.length;
  var direction  = this.direction;
  
  var leftArrowDir = this.leftArrowDir;
  var rightArrowDir= this.rightArrowDir 
  var leftArrowPos = this.leftArrowPos;
  var rightArrowPos= this.rightArrowPos;
  
  var arrowHeadSize = this.arrowHeadSize;
  var arrowSize     = this.arrowSize; 
  
    
  var leftArrowHeadSize  = rightArrowHeadSize = 0.00000000001;
  var leftArrowHeadWidth = rightArrowHeadWidth = 0.00000000001;
  if(this.drawLeftArrow){ leftArrowHeadSize = arrowHeadSize; leftArrowHeadWidth=this.arrowHeadWidth}
  if(this.drawRightArrow){ rightArrowHeadSize = arrowHeadSize; rightArrowHeadWidth= this.arrowHeadWidth}
  
  //direction, origin, length, color, headLength, headRadius, headColor
  var mainArrowLeft = new THREE.ArrowHelper(leftArrowDir, leftArrowPos, arrowSize, this.arrowColor,leftArrowHeadSize, leftArrowHeadWidth);
  var mainArrowRight = new THREE.ArrowHelper(rightArrowDir, rightArrowPos, arrowSize, this.arrowColor,rightArrowHeadSize, rightArrowHeadWidth);
  //mainArrowLeft.scale.z =0.1;
  //mainArrowRight.scale.z=0.1;
  this.add( mainArrowLeft );
  this.add( mainArrowRight );

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
  //this first one is used to get some labeling metrics, and is
  //not always displayed
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,color:this.textColor,bgColor:this.textBgColor});
  this.label.position.copy( this.leftArrowPos );
  //this.label.setRotationFromAxisAngle(this.direction.clone().normalize(), angle);
  //console.log("dir,angl",this.direction, angle, this.label.up);
  
  var labelDefaultOrientation = new THREE.Vector3(-1,0,0); 
  
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors ( labelDefaultOrientation, this.direction.clone() );
  this.label.rotation.setFromQuaternion( quaternion );
  this.label.rotation.z += Math.PI;
  
  var labelWidth = this.label.width;
  var reqWith = labelWidth + 2 * this.arrowHeadSize;
  
  switch(this.labelType)
  {
    case "flat":
      /*this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize, color:this.textColor, background:(this.textBgColor!=null),bgColor:this.textBgColor});*/
    break;
    case "frontFacing":
      this.label = new LabelHelper3d({text:this.text,fontSize:this.fontSize, color:this.textColor, bgColor:this.textBgColor});
    break;
  }
  this.label.position.copy( this.leftArrowPos );
  //this.label.rotation.z = Math.PI;
  
  this.add( this.label );
  
  if( this.arrowsPlacement == "dynamic" )
  {
    if(reqWith>this.length)//if the label + arrows would not fit
    {
      this.arrowSize = Math.max(length/2,6);//we want arrows to be more than just arrowhead in all the cases
      var arrowXPos = this.length/2 + this.arrowSize;
    
      this.leftArrowDir = this.direction.clone().negate();
      this.rightArrowDir = this.leftArrowDir.clone().negate();
      
      this.leftArrowPos.sub( this.leftArrowDir.clone().normalize().multiplyScalar( arrowXPos ) );
      this.rightArrowPos.sub( this.rightArrowDir.clone().normalize().multiplyScalar( arrowXPos ) );
    
      if( labelWidth > this.length)//if even the label itself does not fit
      {
        this.label.position.y -= 5;
        //this.label.position.add( this.direction.clone().multiplyScalar( 5 ) );
      }
    }
  }else if( this.arrowsPlacement == "outside" ){
    //put the arrows outside of measure, pointing "inwards" towards center
    this.arrowSize = Math.max(length/2,6);//we want arrows to be more than just arrowhead in all the cases
    var arrowXPos = this.length/2 + this.arrowSize;
  
    this.leftArrowDir = this.direction.clone().negate();
    this.rightArrowDir = this.leftArrowDir.clone().negate();
    
    this.leftArrowPos.sub( this.leftArrowDir.clone().normalize().multiplyScalar( arrowXPos ) );
    this.rightArrowPos.sub( this.rightArrowDir.clone().normalize().multiplyScalar( arrowXPos ) );
  }
  
}

SizeHelper.prototype._drawSideLines = function(){
  if( this.drawSideLines )
  {
    var sideLength      = this.sideLength;
    var sideLengthExtra = this.sideLengthExtra;
    
    var sideLineGeometry = new THREE.Geometry();
    var sideLineStart  = this.start.clone();
    var sideLineEnd    = sideLineStart.clone().add( this.flatNormal.clone().normalize().multiplyScalar( sideLength+sideLengthExtra ) );
    
    sideLineGeometry.vertices.push( sideLineStart );
    sideLineGeometry.vertices.push( sideLineEnd );
    
    var leftSideLine = new THREE.Line( sideLineGeometry, new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } ) );
    
    var leftToRightOffset = this.end.clone().sub( this.start );
    
    var rightSideLine = leftSideLine.clone();
    rightSideLine.position.add( leftToRightOffset );
    
    this.rightSideLine = rightSideLine;
    this.leftSideLine  = leftSideLine;
    
    this.add( rightSideLine );
    this.add( leftSideLine );
  }
}

SizeHelper.prototype._drawDebugHelpers = function(){
  if(this.debugHelpers) this.remove( this.debugHelpers );

  this.debugHelpers = new THREE.Object3D();
  var directionHelper  = new THREE.ArrowHelper(this.direction.clone().normalize(), this.start, 15, 0XFF0000);
  var startHelper      = new CrossHelper({position:this.start,color:0xFF0000});
  var midHelper        = new CrossHelper({position:this.mid,color:0x0000FF});
  var endHelper        = new CrossHelper({position:this.end,color:0x00FF00});

  this.debugHelpers.add( directionHelper );
  this.debugHelpers.add( startHelper );
  this.debugHelpers.add( midHelper );
  this.debugHelpers.add( endHelper );
  
  this.add( this.debugHelpers );
}
