
/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between star & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/
AngularDimHelper = function(options)
{
  var options = options || {};
  //Todo : auto adjust arrows : if not enough space, arrows shoud be outside
  BaseHelper.call( this );
  this.up = new THREE.Vector3(0,0,1);
  //this.start = start;
  //this.end = end;

  var position = options.position || new THREE.Vector3();
  var direction = this.direction = options.direction || new THREE.Vector3(1,0,0);
  var angle = this.angle = options.angle || 75;//in degrees , not radians
  this.color = options.color || "#000000" ;
  
  this.text = options.text || this.length;
  var textSize = options.textSize || 8;
  
  var sideLength = options.sideLength || 3;
  var sideLengthExtra = options.sideLengthExtra || 2;
  var drawSideLines = options.drawSideLines!== undefined ? options.drawSideLines :true;
  
  var leftArrow = options.leftArrow !== undefined ? options.leftArrow: true  ;
  var rightArrow = options.rightArrow !== undefined ? options.rightArrow : true;

  var lineWidth = options.lineWidth || 1;//TODO: how to ? would require not using simple lines but strips
  //see ANGLE issue on windows platforms
  var labelPos = options.labelPos || "center";
  
  
  angle = angle*Math.PI/180;
  
  var angleStart = 0.3;
  var radius =20;
  
  var startSideLineOrientation = new THREE.Vector3(1,0,0);
  var arcMidOrientation = new THREE.Vector3(1,0,0);
  var endSideLineOrientation = new THREE.Vector3(1,0,0);
  
  var matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart );
  startSideLineOrientation.applyMatrix4( matrix );
  
  matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart+angle/2 );
  arcMidOrientation.applyMatrix4( matrix );
  
  matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart+angle );
  endSideLineOrientation.applyMatrix4( matrix );
  
  var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.8, transparent:true } )

  var startPos = startSideLineOrientation.clone().multiplyScalar(radius);
  var endPos = endSideLineOrientation.clone().multiplyScalar(radius);

  if( drawSideLines )
  {
    var startSLPos = startSideLineOrientation.clone().multiplyScalar(radius-sideLength/2);
    var startSLPos2 = startSideLineOrientation.clone().multiplyScalar(radius+sideLength/2+sideLengthExtra);

    var sideLineGeometry = new THREE.Geometry();
    sideLineGeometry.vertices.push( startSLPos );
    sideLineGeometry.vertices.push( startSLPos2 );
    
    var startSideLine = new THREE.Line( sideLineGeometry, lineMaterial );

    var endSLPos = endSideLineOrientation.clone().multiplyScalar(radius-sideLength/2);
    var endSLPos2 = endSideLineOrientation.clone().multiplyScalar(radius+sideLength/2+sideLengthExtra);
    //FIXME: perhaps do this with just a matrix transform (rotate by angle, translate by radius, of original startLineGeometry)
    var sideLineGeometry = new THREE.Geometry();
    sideLineGeometry.vertices.push( endSLPos );
    sideLineGeometry.vertices.push( endSLPos2 );

    var endSideLine =  new THREE.Line( sideLineGeometry, lineMaterial );
    
    this.add( startSideLine );
    this.add( endSideLine );
  }
  
  var length = 5;//TODO: remove this
  
  var leftArrowDir = new THREE.Vector3(1,0,0);
  var rightArrowDir = new THREE.Vector3(-1,0,0);
  var leftArrowPos = new THREE.Vector3().copy(startPos);//0,sideLength,0);
  var rightArrowPos = new THREE.Vector3().copy(endPos); //0,sideLength,0);
  var arrowHeadSize = 4;
  var arrowSize = arrowHeadSize;//length/2;
  
  //vAngle = angle*180/Math.PI;
  this.text = new String(angle.toFixed(2))+"°";
  var arcMidPosition = arcMidOrientation.clone().multiplyScalar(radius);
  
  //sin(ang/2) = (arrowHeadSize/2) / radius
  //ang/2 = asin( (arrowHeadSize/2) / radius )
  var cBase = arrowHeadSize/2 / radius;
  var fooAngle = Math.asin(cBase);
  //cBase = Math.sin(fooAngle) * radius;
  var cHeight = Math.cos(fooAngle) * radius;

  console.log("angl",fooAngle); 
  
  var blaOrient = new THREE.Vector3(1,0,0);
  var matrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ) , angleStart + fooAngle*2 );
  blaOrient.applyMatrix4( matrix );
  leftArrowPos = blaOrient.clone().multiplyScalar(radius );
  //var leftADirTest = Math.cos(angle/2)*radius;
  leftArrowDir = startPos.clone().sub( leftArrowPos );

  //draw dimention / text
  //var labelPosition = new THREE.Vector3(0,
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.textSize});
  this.label.position.copy( arcMidPosition );
  this.label.rotation.z = Math.PI;
  
  var labelWidth = this.label.width;
  var length = this.length;
  var reqWith = labelWidth + 2*arrowHeadSize;
  
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
  
  var leftArrowHeadSize = rightArrowHeadSize = 0;
  if(leftArrow) leftArrowHeadSize = arrowHeadSize;
  if(rightArrow) rightArrowHeadSize = arrowHeadSize;
  //direction, origin, length, color, headLength, headRadius, headColor
  var mainArrowLeft = new THREE.ArrowHelper(leftArrowDir,leftArrowPos,arrowSize, this.color,leftArrowHeadSize, 2);
  var mainArrowRight = new THREE.ArrowHelper(rightArrowDir,rightArrowPos,arrowSize, this.color,rightArrowHeadSize, 2);
  mainArrowLeft.scale.z =0.1;
  mainArrowRight.scale.z=0.1;
  
  this.add( mainArrowLeft );
  this.add( mainArrowRight );
  
  mainArrowLeft.line.material.linewidth = lineWidth;
  mainArrowRight.line.material.linewidth = lineWidth;
  mainArrowLeft.line.material.linecap = "miter";
  mainArrowRight.line.material.linecap = "miter";

  //draw arc
  var arcGeom = new THREE.CircleGeometry( radius, 30, angleStart, angle );
  arcGeom.vertices.shift();
  var arcLine = new THREE.Line( arcGeom, lineMaterial ); 
  this.add(arcLine);
  
  //general attributes
  this.position = position; 
  var angle = new THREE.Vector3(1,0,0).angleTo(direction); //new THREE.Vector3(1,0,0).cross( direction );
  this.setRotationFromAxisAngle(direction, angle);

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

AngularDimHelper.prototype = Object.create( BaseHelper.prototype );
AngularDimHelper.prototype.constructor = AngularDimHelper;
