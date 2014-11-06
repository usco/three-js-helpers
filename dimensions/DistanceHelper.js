DistanceHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0xFF0000;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#ffd200";
}

DistanceHelper.prototype = Object.create( BaseHelper.prototype );
DistanceHelper.prototype.constructor = DistanceHelper;

DistanceHelper.prototype.toggleText = function(toggle)
{
  this.label.visible = toggle;
  //Fixme:
  this.label.textSprite.visible = toggle;
}

DistanceHelper.prototype.set = function( options )
{
  var options = options || {};
  var start   = options.start !== undefined ? options.start.clone() : new THREE.Vector3();
  var end     = options.end !== undefined ? options.end.clone()   : new THREE.Vector3(10,0,0);
  var direction = new THREE.Vector3(1,0,0);
  
  if(end && start)
  {
    direction = end.clone().sub( start.clone() );
    options.length = direction.length();
  }
  
  console.log("start", start, "end", end, "length", options.length,"direction", direction);
  
  var length = options.length !== undefined ? options.length : 50;
  var textSize  = options.textSize  !== undefined? options.textSize: 10;
  var precision = options.precision !== undefined? options.precision: 2;
  var text   = options.text !== undefined   ? options.text   : length.toFixed(precision) + "";//coerce as str

  var crossSize = 10;
  
  //starting point cross
  if(this.startCross) this.remove( this.startCross );
  var startCrossGeometry = new THREE.Geometry();
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, -crossSize/2, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, crossSize/2 , 0 ) );
  
  startCrossGeometry.vertices.push( new THREE.Vector3( -crossSize/2, 0, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( crossSize/2, 0 , 0 ) );
  
  var crossMaterial = new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } )
  var lineMaterial = new THREE.LineDashedMaterial( { color: 0xff0000, dashSize: 1.5, gapSize: 25,linewidth:1,depthTest:false,depthWrite:false,renderDepth : 1e20,} )
  this.startCross = new THREE.Line( startCrossGeometry, crossMaterial ,THREE.LinePieces );
  this.startCross.position.copy( start ); 
  this.add( this.startCross ) ;
  
  //main arrow
  this.arrow = new THREE.ArrowHelper(direction.normalize(), start, length ,this.arrowColor, 3, 1);
  this.arrow.line.geometry.computeLineDistances();
  this.arrow.line.material = new THREE.LineDashedMaterial( { color: this.arrowColor,
   linewidth:1,depthTest:false,depthWrite:false,renderDepth : 1e20,} );
  this.arrow.cone.material = new THREE.MeshBasicMaterial({color:this.arrowColor,depthTest:false,depthWrite:false,renderDepth : 1e20});
  this.arrow.position.copy( start );
  this.add( this.arrow ) ;
  
  //length label
  this.label = new LabelHelper3d({text:text,fontSize:textSize,bgColor:this.textBgColor});
  //new LabelHelperPlane({text:this.text,fontSize:this.textSize});
  
  //at midpoint
  var labelPos = start.clone().add( direction.clone().multiplyScalar( length/2 ) );
  this.label.position.copy( labelPos );  //.x = length/2;
  
  this.add( this.label );
}

DistanceHelper.prototype.setStart = function( options )
{
  var options = options || {};
  var start   = options.start !== undefined ? options.start.clone() : new THREE.Vector3();
  var crossSize = 10;
  
  var startCrossGeometry = new THREE.Geometry();
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, -crossSize/2, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( 0, crossSize/2 , 0 ) );
  
  startCrossGeometry.vertices.push( new THREE.Vector3( -crossSize/2, 0, 0 ) );
  startCrossGeometry.vertices.push( new THREE.Vector3( crossSize/2, 0 , 0 ) );
  
  var crossMaterial = new THREE.LineBasicMaterial( { color: 0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20, opacity:0.4, transparent:true } )
  var lineMaterial = new THREE.LineDashedMaterial( { color: 0xff0000, dashSize: 1.5, gapSize: 25,linewidth:1} )
  this.startCross = new THREE.Line( startCrossGeometry, crossMaterial ,THREE.LinePieces );
  this.startCross.position.copy( start ); 
  this.add( this.startCross ) ;
}

DistanceHelper.prototype.unset = function( )
{
  this.remove( this.startCross );
  this.remove( this.arrow );
  this.remove( this.label );

}
