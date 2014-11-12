DistanceHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0xFF0000;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#ffd200";
  
  this.arrowHeadSize   = 4;
  this.start = undefined;
  this.end   = undefined;
  this.distance = undefined;
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
  
  //console.log("start", start, "end", end, "length", options.length,"direction", direction);
  
  var length = options.length !== undefined ? options.length : 50;
  var textSize  = options.textSize  !== undefined? options.textSize: 10;
  var precision = options.precision !== undefined? options.precision: 2;
  var text   = options.text !== undefined   ? options.text   : length.toFixed(precision) + "";//coerce as str

  //FIXME:hack
  this.direction = direction;
  this.length = length;
  this.text = text;
  
  //main arrow
  this.arrow = new THREE.ArrowHelper(direction.normalize(), start, length ,this.arrowColor, this.arrowHeadSize, 2)//, 3, 1);
  this.arrow.line.geometry.computeLineDistances();
  this.arrow.line.material = new THREE.LineDashedMaterial( { color: this.arrowColor,
   linewidth:1,depthTest:false,depthWrite:false,renderDepth : 1e20,} );
  this.arrow.cone.material = new THREE.MeshBasicMaterial({color:this.arrowColor,depthTest:false,depthWrite:false,renderDepth : 1e20});
  this.arrow.position.copy( start );
  this.add( this.arrow ) ;
  
  this.drawLabel();
  
}

DistanceHelper.prototype.setStart = function( start )
{
  if(!start) return;
  this.start = start;
  this.startCross = new CrossHelper({position:start});
  this.add( this.startCross ) ;
}

DistanceHelper.prototype.setEnd = function( end )
{
  if(!end) return;
  this.end = end;
  
  this.distance = end.clone().sub(this.start).length();
  //FIXME: hack for now
  this.set({start:this.start, end:this.end});
}

DistanceHelper.prototype.unset = function( )
{
  this.remove( this.startCross );
  this.remove( this.arrow );
  this.remove( this.label );
}

DistanceHelper.prototype.drawLabel = function( )
{
  //length label
  this.label = new LabelHelper3d({text:this.text,fontSize:this.textSize,bgColor:this.textBgColor});
  //new LabelHelperPlane({text:this.text,fontSize:this.textSize});
  //at midpoint
  var labelPos = this.start.clone().add( this.direction.clone().multiplyScalar( this.length/2 ) );
  this.label.position.copy( labelPos );  //.x = length/2;
  
  this.add( this.label );
}
