DistanceHelper = function(options)
{
  var options = options || {};
  var start = options.start || new THREE.Vector3();
  var end = options.end || new THREE.Vector3(10,0,0);
  var direction = new THREE.Vector3(1,0,0);
  
  if(end && start)
  {
    options.length = end.clone().sub( start ).length();
    var direction = (end.clone().sub(start)).normalize();
  }
  
  var length = this.length = options.length || 50;

  var crossSize = 10;
 
  var text = this.text = options.text || this.length;
  var textSize = options.textSize || 10;

  BaseHelper.call( this );
  
  //starting point cross
  var startCrossGeometry = new THREE.Geometry();
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, -crossSize/2, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, crossSize/2 , 0 ) );
  
  startCrossGeometry.vertices.push( new THREE.Vector3( -crossSize/2, 0, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( crossSize/2, 0 , 0 ) );
  
  var crossMaterial = new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } )
  var lineMaterial = new THREE.LineDashedMaterial( { color: 0xff0000, dashSize: 1.5, gapSize: 25,linewidth:1} )
  this.startCross = new THREE.Line( startCrossGeometry, crossMaterial ,THREE.LinePieces );
  this.add( this.startCross ) ;
  
  //main arrow
  this.arrow = new THREE.ArrowHelper(direction, start, length ,0xff0000, 14, 5);
  this.arrow.scale.z =0.1;
  this.arrow.line.geometry.computeLineDistances();
  this.arrow.line.material = lineMaterial;
  this.add( this.arrow ) ;
  
  //length label
  this.label = new LabelHelper3d({text:this.text,fontSize:this.textSize});
  //at midpoint
  var labelPos = start.clone().add( direction.clone().multiplyScalar( length/2 ) );
  this.label.position = labelPos;  //.x = length/2;
  
  this.add( this.label );
}

DistanceHelper.prototype = Object.create( BaseHelper.prototype );
DistanceHelper.prototype.constructor = DistanceHelper;

DistanceHelper.prototype.toggleText = function(toggle)
{
  this.label.visible = toggle;
  //Fixme:
  this.label.textSprite.visible = toggle;
}
