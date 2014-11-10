
/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between star & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/
AngularDimHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  //Todo : auto adjust arrows : if not enough space, arrows shoud be outside
  this.up = new THREE.Vector3(0,0,1);
  //this.start = start;
  //this.end = end;

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
  
  this.angle = angle*Math.PI/180;
  
  //this.set();
}

AngularDimHelper.prototype = Object.create( BaseHelper.prototype );
AngularDimHelper.prototype.constructor = AngularDimHelper;

AngularDimHelper.prototype.computeAngle = function(start, mid, end){
  var v1 = start.clone().sub( mid );
  var v2 = end.clone().sub( mid );
  var angle = v1.angleTo( v2 );
  return angle;
}

AngularDimHelper.prototype.setStart = function(start){
  this.start = start;
  
  this.startCross = new CrossHelper({position:start, color:0xFF0000});
  this.add( this.startCross );
}

AngularDimHelper.prototype.setMid = function(mid){
  this.mid = mid;
  
  this.midCross = new CrossHelper({position:mid, color:0x0000FF});
  this.add( this.midCross );
  
  //draw line from start to mid
  var startMidLineGeometry = new THREE.Geometry();
  startMidLineGeometry.vertices.push( this.start );
  startMidLineGeometry.vertices.push( this.mid );
  
  var lineMaterial = new THREE.LineBasicMaterial( { color: this.linesColor, linewidth:1, depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.8, transparent:true } )
  
  this.startMidLine = new THREE.Line( startMidLineGeometry, lineMaterial );
  this.add( this.startMidLine );
}

AngularDimHelper.prototype.setEnd = function(end){
  this.end = end;
  
  this.endCross = new CrossHelper({position:end, color:0x00FF00});
  this.add( this.endCross );
  
  //draw line from start to mid
  var midEndLineGeometry = new THREE.Geometry();
  midEndLineGeometry.vertices.push( this.mid );
  midEndLineGeometry.vertices.push( this.end );
  
  var lineMaterial = new THREE.LineBasicMaterial( { color: this.linesColor, linewidth:1, depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.8, transparent:true } )
  
  this.midEndLine = new THREE.Line( midEndLineGeometry, lineMaterial );
  this.add( this.midEndLine );
  
  //compute angle from star, mid & end points
  if(this.start && this.mid && this.end){
    this.angle = this.computeAngle( this.start, this.mid, this.end );
  }
  
  
  //EXPERIMENTAL
  //draw arc
  //get the plane from the 3 points
  var plane = new THREE.Plane().setFromCoplanarPoints( this.end, this.mid, this.start );
  
  var midToStart = this.start.clone().sub( this.mid );
  var midToEnd  = this.end.clone().sub( this.mid );
  midToStart.normalize();
  midToEnd.normalize();
  
  
  var adj = midToStart.x;
  var hyp = midToStart.y;
  var angleStart = (Math.acos( adj /hyp));
  
  angleStart = midToStart.angleTo( new THREE.Vector3(1,0,0 ) );//this.mid );
    console.log(angleStart);
  //Math.PI/2 - (Math.acos( adj /hyp))
  //console.log("computed angle", this.angle, "angleStart",angleStart, "plane normal", plane.normal);
    
  //angleStart = 0;
  angle = this.angle;
  radius = (this.end.clone().sub( this.mid ) ).length();
  var arcGeom = new THREE.CircleGeometry( radius, 30, angleStart, angle  );
  arcGeom.vertices.shift();
  this.arcLine = new THREE.Line( arcGeom, lineMaterial ); 
  
  //this.arcLine.lookAt( plane.normal.clone().normalize() );
  
  //alt
  
  var start2d = this.start.clone().projectOnPlane( plane.normal );
  var end2d = this.end.clone().projectOnPlane( plane.normal );
  //console.log("2d projection", start2d, end2d);
  
  /*circleShape = new THREE.Shape();
	circleShape.moveTo( 0, radius );
	circleShape.quadraticCurveTo( radius, radius, radius, 0 );
	circleShape.quadraticCurveTo( radius, -radius, 0, -radius );
	circleShape.quadraticCurveTo( -radius, -radius, -radius, 0 );
	circleShape.quadraticCurveTo( -radius, radius, 0, radius );*/
	
	
	var arcOuterRadius = radius /2;
	var arcInnerRadius = radius /3;
	
	
	var insetPos = midToEnd.clone().multiplyScalar( arcInnerRadius ); 
	var outsetPos= midToStart.clone().multiplyScalar( arcOuterRadius );
	
	var circleShape = new THREE.Shape();
	//circleShape.moveTo( outsetPos.x, outsetPos.y );
	circleShape.absarc( 0, 0, arcOuterRadius, -this.angle/2, this.angle/2, true );
  //circleShape.lineTo( insetPos.x, insetPos.y );
	circleShape.absarc( 0, 0, arcInnerRadius, this.angle/2, -this.angle/2, true );
	//circleShape.lineTo( arcOuterRadius, 0 );
	//circleShape.lineTo( outsetPos.x, outsetPos.y );
  
	
  var points = circleShape.createPointsGeometry();
  //points.vertices.shift();
	this.arcLine = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 2 } ) );
	
  //this.arcLine.add( new CrossHelper({position:insetPos,color:0x0000FF} ) );
  //this.arcLine.add( new CrossHelper({position:outsetPos,color:0xFF0000} ) );
	
	var gna = this.end.clone().sub( this.start ).divideScalar( 2 ).add( this.start );
	console.log("start", this.start, "end", this.end, "gna", gna);
	var direction = (gna.clone()).sub( this.mid ).normalize();
	var defaultOrientation = new THREE.Vector3(1,0,0); 
  
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors ( defaultOrientation, direction.clone() );
  this.arcLine.rotation.setFromQuaternion( quaternion );
  
  //this.arcLine.rotation.z += (Math.PI-0.3);
	
	//this.add( new THREE.ArrowHelper(direction,this.mid,20,0XFF0000) );
	//this.add( new CrossHelper({position:gna,color:0x0000FF} ) );
	
	
	this.add( this.arcLine );
  this.arcLine.position.copy( this.mid );

  

  //this.set(); 
  
  this._drawLabel();
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

  this.remove( this.label);
  this.remove( this.arcLine );
  this.remove( this.mainArrowLeft );
  this.remove( this.mainArrowRight );
  
  if( this.startCross ) this.remove( this.startCross );
  if( this.midCross )   this.remove( this.midCross );
  if( this.endCross )   this.remove( this.endCross );
    
  if( this.startSideLine ) this.remove( this.startSideLine );
  if( this.endSideLine )   this.remove( this.endSideLine );
  
  if( this.startMidLine ) this.remove( this.startMidLine );
  if( this.midEndLine )   this.remove( this.midEndLine );
}

AngularDimHelper.prototype.drawArc = function(){

}


AngularDimHelper.prototype._drawLabel = function(){
  //draw angle / text
  
  var degAngle = this.angle*180/Math.PI;
  this.text = new String(degAngle.toFixed(2))+"°";
  
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
  this.label.position.copy( this.mid );
  //this.label.rotation.z = Math.PI;
  
  //var labelWidth = this.label.width;
  //var reqWith = labelWidth + 2*arrowHeadSize;
  
  /*if(reqWith>length)//if the labe + arrows would not fit
  {
    arrowSize = Math.max(length/2,6);//we want arrows to be more than just arrowhead in all the cases
    var arrowXPos = length/2+arrowSize;
  
    leftArrowDir = new THREE.Vector3(-1,0,0);//reverse orientation of arrows
    rightArrowDir = new THREE.Vector3(1,0,0);
    leftArrowPos = new THREE.Vector3(arrowXPos,sideLength,0);
    rightArrowPos = new THREE.Vector3(-arrowXPos,sideLength,0);
    if(labelWidth>length)//if even the label itself does not fit
    {
      this.label.position.y += 5;
    }
  }*/
  this.add( this.label );
}

  

