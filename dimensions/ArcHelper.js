/*
//TODO: make this into a mesh / geometry subclass
*/
ArcHelper = function(options)
{
  BaseHelper.call( this );
  
  var options = options || {}

  var position = options.position || new THREE.Vector3();
  
  var direction = this.direction = options.direction || new THREE.Vector3();
  this.color  = options.color!== undefined ? options.color : "#000";
  
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#ffd200";
  this.mode = options.mode!== undefined ? options.mode : "line";//filled or line
  
  this.outerRadius = 0;
  this.innerRadius = 0;
  this.start = 0;
  this.end = 0;
  
  var defaultMaterial = new THREE.MeshBasicMaterial({color:this.textBgColor,
	depthTest:false,depthWrite:false,side : THREE.DoubleSide } );
  this.material = options.material!== undefined ? options.material : defaultMaterial;
  
  this.lineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000,depthTest:false,depthWrite:false, opacity:0.4, transparent:true, linewidth: 2 } )
  
  //this.setRadius(this.radius);
  this._generate();
}

ArcHelper.prototype = Object.create( BaseHelper.prototype );
ArcHelper.prototype.constructor = ArcHelper;  

ArcHelper.prototype._generate = function(){
  var circleShape = new THREE.Shape();
  circleShape.absarc( 0, 0, this.outerRadius, this.start, this.end, true );
	circleShape.absarc( 0, 0, this.innerRadius, this.start, this.end,  false );
	
	if(this.arcLine) this.remove( this.arcLine );
	
  var points = circleShape.createPointsGeometry();
  //points.vertices.shift();
	if(this.mode == "line") this.arcLine = new THREE.Line( points, this.lineMaterial );
	else if(this.mode == "filled"){
	  var filledArcGeometry = new THREE.ShapeGeometry( circleShape, {curveSegments:30} );
	  this.arcLine = new THREE.Mesh( filledArcGeometry, this.material );
	  this.arcLine.renderDepth = 1e20;
	}
	
	this.add( this.arcLine );
}

ArcHelper.prototype.setRadius = function( radius ){

  /*var circleRadius = this.radius = radius;; 
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  
  if(this.rCircle) this.remove( this.rCircle );
  
  this.rCircle = new THREE.Line(points, this.material );
  this.add( this.rCircle );*/
}  

ArcHelper.prototype.setStart = function( start ){
  this.start = start;
  this._generate();
}

ArcHelper.prototype.setEnd = function( end ){
  this.end = end;
  this._generate();
}

ArcHelper.prototype.setOuterRadius = function( outerRadius ){
  this.outerRadius = outerRadius;
  this._generate();
}

ArcHelper.prototype.setInnerRadius = function( innerRadius ){
  this.innerRadius = innerRadius;
  this._generate();
}



 
