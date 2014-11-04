
/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between star & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/

//TODO: how to put items on the left instead of right, front instead of back etc
SizeHelper = function(options)
{
  var options = options || {};
  //Todo : auto adjust arrows : if not enough space, arrows shoud be outside
  BaseHelper.call( this );
  this.up = new THREE.Vector3(0,0,1);
  //this.start = start;
  //this.end = end;
  var position = options.position || new THREE.Vector3();
  var direction = this.direction = options.direction || new THREE.Vector3(1,0,0);
  
  var start = options.start || position;
  var end = options.end ;
  if(end && start)
  {
    position = start.clone();
    //position = position.multiplyScalar(0.2);
    //position.x = -40 //-= position.x;
    options.length = end.clone().sub( start ).length();
    //console.log("start",start,"end", end);
    direction = this.direction = (start.clone().sub(end)).normalize();
    //console.log("dir", direction);
  }
  //TODO: do this better  
  var length = this.length = options.length || 10;
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

  if( drawSideLines )
  {
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

    
  var leftArrowDir = new THREE.Vector3(1,0,0);
  var rightArrowDir = new THREE.Vector3(-1,0,0);
  var leftArrowPos = new THREE.Vector3(0,sideLength,0);
  var rightArrowPos = new THREE.Vector3(0,sideLength,0);
  var arrowHeadSize = 4;
  var arrowSize = length/2;
  
  //draw dimention / text
  this.label = new LabelHelperPlane({text:this.text,fontSize:this.textSize});
  this.label.position.y = sideLength;
  this.label.rotation.z = Math.PI;
  
  var labelWidth = this.label.width;
  var length = this.length;
  var reqWith = labelWidth + 2*arrowHeadSize;
  
  if(reqWith>length)//if the label + arrows would not fit
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
  }
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
  
  //general attributes
  this.position.copy( position ); 
  var angle = new THREE.Vector3(1,0,0).angleTo(direction);
  this.setRotationFromAxisAngle(direction,angle);

  //leftSideLine.renderDepth = 1e20;
  //rightSideLine.renderDepth = 1e20;

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

SizeHelper.prototype = Object.create( BaseHelper.prototype );
SizeHelper.prototype.constructor = SizeHelper;
