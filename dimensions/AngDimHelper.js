

AngularDimHelper = function(options)
{
  AnnotationHelper.call( this );
  var options = options || {};
  //Todo : auto adjust arrows : if not enough space, arrows shoud be outside
  this.up = new THREE.Vector3(0,0,1);

  var position  = this.position  = options.position !== undefined ? options.position : new THREE.Vector3();
  this.direction = options.direction !== undefined ? options.direction : new THREE.Vector3(1,0,0);//should this be oposite angle ?
  var angle     = this.angle     = options.angle !== undefined ? options.angle : 75;//in degrees , not radians
  var radians   = this.radians   = options.radians !== undefined? options.radians: false;
  
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  this.linesColor = options.linesColor !== undefined ? options.linesColor : 0x000000;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#ffd200";
  
  var fontSize  = options.fontSize  !== undefined? options.fontSize: 10;
  var precision = options.precision !== undefined? options.precision: 2;
  var text      = options.text      !== undefined? options.text   : angle.toFixed(precision) + "";//coerce as str
  this.labelType  = options.labelType!== undefined ? options.labelType : "frontFacing";
  
  
  this.sideLength      = options.sideLength!== undefined ? options.sideLength : 3;
  this.sideLengthExtra = options.sideLengthExtra!== undefined ? options.sideLengthExtra : 3;
  this.drawSideLines   = options.drawSideLines!== undefined ? options.drawSideLines :true;
  
  this.leftArrow = options.leftArrow !== undefined ? options.leftArrow: true  ;
  this.rightArrow = options.rightArrow !== undefined ? options.rightArrow : true;
  this.arrowHeadSize   = 4;

  this.lineWidth = options.lineWidth || 1;//TODO: how to ? would require not using simple lines but strips
  //see ANGLE issue on windows platforms
  var labelPos = options.labelPos || "center";
  
  this.radius = 20 ;
  
  
  //initialise internal sub objects
  this.startCross = new CrossHelper({color:0xFF0000});
  this.startCross.hide();
  this.add( this.startCross );
  
  this.midCross = new CrossHelper({color:0x0000FF});
  this.midCross.hide();
  this.add( this.midCross );
  
  this.endCross = new CrossHelper({color:0x00FF00});
  this.endCross.hide();
  this.add( this.endCross );
  
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
  this.label.hide();
  this.add( this.label );
  
  //line from start to mid
  this.startMidLine = new SizeHelper( { drawLeftArrow:false, arrowsPlacement:"inside", 
  drawLabel:false, arrowColor:this.arrowColor, 
    linesColor:this.arrowColor,
    textBgColor:this.textBgColor,textColor:this.textColor, labelType:
    this.labelType} ); 
  this.startMidLine.hide();
  this.add( this.startMidLine );
  
   //line from mid to end
  this.midEndLine = new SizeHelper( { drawRightArrow:false, arrowsPlacement:"inside", 
  drawLabel:false,  arrowColor:this.arrowColor, 
    linesColor:this.arrowColor,
    textBgColor:this.textBgColor,textColor:this.textColor, labelType:
    this.labelType} ); 
  this.midEndLine.hide();
  this.add( this.midEndLine );
  this.add( this.midEndLine );
  
  this.arc = new ArcHelper({textBgColor:this.textBgColor});
  this.arc.hide();
  this.add( this.arc );
  
  
  this.start           = options.start!== undefined ? options.start : undefined;
  this.startObject     = options.startObject!== undefined ? options.startObject : undefined;
  this.mid             = options.mid!== undefined ? options.mid : undefined;
  this.midObject       = options.midObject!== undefined ? options.midObject : undefined;
  this.end             = options.end!== undefined ? options.end : undefined;
  this.endObject       = options.endObject!== undefined ? options.endObject : undefined;
  
  this.angle = angle*Math.PI/180;
  
  if( options.start ) this.setStart( this.start, this.startObject );
  if( options.mid ) this.setMid( this.mid, this.midObject );
  if( options.end )   this.setEnd( this.end, this.endObject );
}

AngularDimHelper.prototype = Object.create( AnnotationHelper.prototype );
AngularDimHelper.prototype.constructor = AngularDimHelper;


AngularDimHelper.prototype.setStart = function( start, object ){
  this.start = start;
  this.startObject = object;
  
  this.startCross.position.copy( this.start );
  this.startCross.show();
  
  this.startMidLine.setStart( this.start );
}

AngularDimHelper.prototype.setMid = function( mid, object ){
  this.mid = mid;
  this.midObject = object;
  
  this.midCross.position.copy( this.mid );
  this.midCross.show();  
  
  this.startMidLine.setEnd( this.mid );
  this.startMidLine.show();
  
  this.midEndLine.setStart( this.mid );
}

AngularDimHelper.prototype.setEnd = function( end, object ){
  this.end = end;
  this.endObject = object;
  
  this.endCross.position.copy( this.end );
  this.endCross.show();
  
  //compute angle from star, mid & end points
  if(this.start && this.mid && this.end){
    this.angle = this.computeAngle( this.start, this.mid, this.end );
  }
  
  this.midEndLine.setEnd( this.end );
  this.midEndLine.show();
  
  
  //EXPERIMENTAL
  //draw arc
  //get the plane from the 3 points
  this.opositeAngle = false;
  this.debug = false;
  if(this.opositeAngle)
  {
    this.angle = Math.PI*2 - this.angle;
  }
  var angle = this.angle;
  var plane = new THREE.Plane().setFromCoplanarPoints( this.end, this.mid, this.start );
  
  var midToStart    = this.start.clone().sub( this.mid );
  var midToEnd      = this.end.clone().sub( this.mid );
  var midToStartDir = midToStart.clone().normalize();
  var midToEndDir   = midToEnd.clone().normalize();
  
  var side = midToEnd;
	var sideLength = side.length();
  //offset start is a point on the vector mid -> start that is a far away from mid as end is
  var offsetStart = midToStartDir.clone().multiplyScalar( sideLength );
	offsetStart.add( this.mid);
  var endToOffsetStart = this.end.clone().sub( offsetStart );
  
  var radius = midToEnd.length();
  var arcOuterRadius = radius /1.5;
	var arcInnerRadius = radius /2;
  
  //console.log("start", this.start, "offsetStart", offsetStart, "end", this.end);
	
	//first parallel is :
	//endToOffsetStart
	//make a second, going through mid
	var paral = endToOffsetStart.clone().normalize();//.add( this.mid );
	paral = new THREE.Vector3(0,-1, 0 );
	var midToStartAngle = paral.angleTo( midToStart );
	//console.log("midToStartAngle",midToStartAngle*180/Math.PI); 
	
	var arcAngle = this.angle;
	var arcAngleStart= - Math.PI/2 + midToStartAngle;
	var arcAngleEnd = arcAngleStart + arcAngle;
	
	
	this.arc.setStart( arcAngleStart );
	this.arc.setEnd( arcAngleEnd );
	this.arc.setOuterRadius( arcOuterRadius );
	this.arc.setInnerRadius( arcInnerRadius );
	
	var arcCenter = this.end.clone().sub( offsetStart ).divideScalar( 2 ).add( offsetStart );
	var direction = (arcCenter.clone()).sub( this.mid ).normalize();
	if(this.opositeAngle){
	  direction.negate();
	}
	
	var defaultOrientation = new THREE.Vector3(1,0,0); 
  var planeQuaternion = new THREE.Quaternion();
  planeQuaternion.setFromUnitVectors ( new THREE.Vector3(0,0,1), plane.normal.clone() );
  
  var frontFacingQuaternion = new THREE.Quaternion();
  frontFacingQuaternion.setFromUnitVectors ( defaultOrientation, direction.clone() );
  //this.arc.rotation.setFromQuaternion( quaternion );
  
  var comboQuaternion = new THREE.Quaternion();
  comboQuaternion.multiplyQuaternions( frontFacingQuaternion, planeQuaternion );
  
  var foo = new THREE.Quaternion();
  foo.setFromUnitVectors ( new THREE.Vector3(1,0,1), plane.normal.clone().add(direction.clone()) );
  
  this.arc.rotation.setFromQuaternion( foo );
  this.arc.position.copy( this.mid );
  this.arc.show();
  
  this.label.setText( (this.angle*180/Math.PI).toFixed(2) );
  this.label.position.copy( arcCenter );
  this.label.show();
 
  
	if( this.debug ){
	  this.debugHelpers = new THREE.Object3D();
	  //this.debugHelpers.add( new THREE.ArrowHelper(direction,this.mid,20,0XFF0000) );
	  this.debugHelpers.add( new CrossHelper({position:offsetStart,color:0xFF00FF} ) );
	  //this.debugHelpers.add( new CrossHelper({position:this.start,color:0x0000FF} ) );
	
	  this.debugHelpers.add( new CrossHelper({position:arcCenter,color:0x0000FF} ) );
	  this.debugHelpers.add( new THREE.ArrowHelper(plane.normal,arcCenter,20,0XFF0000) ); 
    this.debugHelpers.add( new THREE.ArrowHelper(midToStartDir,this.mid,20,0XFF0000) ); 
    
	  this.debugHelpers.add( new THREE.ArrowHelper(paral,this.mid,20,0XFFFF00) ); 
    this.debugHelpers.add( new THREE.ArrowHelper(endToOffsetStart.clone().normalize(),offsetStart,20,0XFFFF00) ); 
	
	  this.add( this.debugHelpers );
	}
}

AngularDimHelper.prototype.computeAngle = function(start, mid, end){
  var v1 = start.clone().sub( mid );
  var v2 = end.clone().sub( mid );
  var angle = v1.angleTo( v2 );
  return angle;
}

AngularDimHelper.prototype.set = function(){
  var angleStart = 0.3;
  var radius = this.radius;
  var angle  = this.angle;
  
  var startSideLineOrientation = new THREE.Vector3(1,0,0);
  var arcMidOrientation = new THREE.Vector3(1,0,0);
  var endSideLineOrientation = new THREE.Vector3(1,0,0);
  
  var matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart );
  startSideLineOrientation.applyMatrix4( matrix );
  
  matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart+angle/2 );
  arcMidOrientation.applyMatrix4( matrix );
  
  matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart+angle );
  endSideLineOrientation.applyMatrix4( matrix );
  
  var lineMaterial = new THREE.LineBasicMaterial( { color: this.linesColor, linewidth:1, depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.8, transparent:true } )

  var startPos = startSideLineOrientation.clone().multiplyScalar(radius);
  var endPos = endSideLineOrientation.clone().multiplyScalar(radius);

  if( this.drawSideLines )
  {
    var startSLPos = startSideLineOrientation.clone().multiplyScalar( radius- this.sideLength/2 );
    var startSLPos2 = startSideLineOrientation.clone().multiplyScalar( radius+ this.sideLength/2 + this.sideLengthExtra );

    var sideLineGeometry = new THREE.Geometry();
    sideLineGeometry.vertices.push( startSLPos );
    sideLineGeometry.vertices.push( startSLPos2 );
    
    var startSideLine = new THREE.Line( sideLineGeometry, lineMaterial );

    var endSLPos = endSideLineOrientation.clone().multiplyScalar( radius - this.sideLength/2 );
    var endSLPos2 = endSideLineOrientation.clone().multiplyScalar( radius + this.sideLength/2 + this.sideLengthExtra);
    //FIXME: perhaps do this with just a matrix transform (rotate by angle, translate by radius, of original startLineGeometry)
    var sideLineGeometry = new THREE.Geometry();
    sideLineGeometry.vertices.push( endSLPos );
    sideLineGeometry.vertices.push( endSLPos2 );

    var endSideLine =  new THREE.Line( sideLineGeometry, lineMaterial );
    
    this.startSideLine = startSideLine;
    this.endSideLine   = endSideLine;
    this.add( startSideLine );
    this.add( endSideLine );
  }
  
  var leftArrowDir = new THREE.Vector3(1,0,0);
  var rightArrowDir = new THREE.Vector3(-1,0,0);
  var leftArrowPos = new THREE.Vector3().copy(startPos);//0,sideLength,0);
  var rightArrowPos = new THREE.Vector3().copy(endPos); //0,sideLength,0);
  var arrowHeadSize = 4;
  var arrowSize = arrowHeadSize;//length/2;
  
  
  var arcMidPosition = arcMidOrientation.clone().multiplyScalar(radius);
  
  //sin(ang/2) = (arrowHeadSize/2) / radius
  //ang/2 = asin( (arrowHeadSize/2) / radius )
  var cBase = arrowHeadSize/2 / radius;
  var fooAngle = Math.asin(cBase);
  //cBase = Math.sin(fooAngle) * radius;
  var cHeight = Math.cos(fooAngle) * radius;

  
  var blaOrient = new THREE.Vector3(1,0,0);
  var matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart + fooAngle*2 );
  blaOrient.applyMatrix4( matrix );
  leftArrowPos = blaOrient.clone().multiplyScalar(radius );
  //var leftADirTest = Math.cos(angle/2)*radius;
  leftArrowDir = startPos.clone().sub( leftArrowPos );

  var leftArrowHeadSize = rightArrowHeadSize = 0;
  if(this.leftArrow) leftArrowHeadSize = arrowHeadSize;
  if(this.rightArrow) rightArrowHeadSize = arrowHeadSize;
  //direction, origin, length, color, headLength, headRadius, headColor
  var mainArrowLeft = new THREE.ArrowHelper(leftArrowDir,leftArrowPos,arrowSize, this.arrowColor,leftArrowHeadSize, 2);
  var mainArrowRight = new THREE.ArrowHelper(rightArrowDir,rightArrowPos,arrowSize, this.arrowColor,rightArrowHeadSize, 2);
  mainArrowLeft.scale.z =0.1;
  mainArrowRight.scale.z=0.1;
  
  this.mainArrowLeft  = mainArrowLeft;
  this.mainArrowRight = mainArrowRight;
  
  this.add( mainArrowLeft );
  this.add( mainArrowRight );
  
  mainArrowLeft.line.material.linewidth = this.lineWidth;
  mainArrowRight.line.material.linewidth = this.lineWidth;
  mainArrowLeft.line.material.linecap = "miter";
  mainArrowRight.line.material.linecap = "miter";

  //draw arc
  var arcGeom = new THREE.CircleGeometry( radius, 30, angleStart, angle );
  arcGeom.vertices.shift();
  this.arcLine = new THREE.Line( arcGeom, lineMaterial ); 
  this.add( this.arcLine );
  
  //general attributes
  var angle = new THREE.Vector3(1,0,0).angleTo( this.direction ); //new THREE.Vector3(1,0,0).cross( direction );
  this.setRotationFromAxisAngle( this.direction, angle );

  mainArrowRight.renderDepth = 1e20;
  mainArrowRight.cone.material.depthTest=false;
  mainArrowRight.cone.material.depthWrite=false;
  mainArrowRight.line.material.depthTest=false;
  mainArrowRight.line.material.depthWrite=false;
  
  mainArrowLeft.renderDepth = 1e20;
  mainArrowLeft.cone.material.depthTest=false;
  mainArrowLeft.cone.material.depthWrite=false;
  mainArrowLeft.line.material.depthTest=false;
  mainArrowLeft.line.material.depthWrite=false;
}

AngularDimHelper.prototype.unset = function(){

  this.label.hide();
  this.arc.hide();
  
  this.startCross.hide();
  this.midCross.hide();
  this.endCross.hide();
  
  this.startMidLine.hide();
  this.midEndLine.hide();
  
  //if( this.debugHelpers ) this.remove( this.debugHelpers );
}


AngularDimHelper.prototype.setLabelType = function(){
  
  var degAngle = this.angle*180/Math.PI;
  this.text = new String(degAngle.toFixed(2))+"°";
  
  switch(this.labelType)
  {
    case "flat":
      this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
    break;
    case "frontFacing":
      this.label = new LabelHelper3d({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
    break;
  }
  
  this.label.position.copy( this.mid );
}


  

