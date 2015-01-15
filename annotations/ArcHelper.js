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
  this.mode = options.mode!== undefined ? options.mode : "line";//line, outline, or filled
  
  this.arrowsLength   = options.arrowsLength!== undefined ? options.arrowsLength : 4;
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  this.drawLeftArrow  = options.drawLeftArrow!== undefined ? options.drawLeftArrow : true;
  this.drawRightArrow = options.drawRightArrow!== undefined ? options.drawRightArrow : true;
  this.arrowHeadWidth  = 1;
  
  this.outerRadius = 0;
  this.innerRadius = 0;
  this.startAngle = 0;
  this.endAngle  = 0;
  
  this.start  = new THREE.Vector3();
  this.mid    = new THREE.Vector3();
  this.end    = new THREE.Vector3();
  this.origin = new THREE.Vector3();
  
  this.leftArrow  = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), this.start, 15, this.arrowColor);
  //this.leftArrow.hide();
  this.add( this.leftArrow );
  
  this.rightArrow = new THREE.ArrowHelper(new THREE.Vector3(-1,0,0), this.end, 15, this.arrowColor);
  //this.rightArrow.hide();
  this.add( this.rightArrow );

  
  var defaultMaterial = new THREE.MeshBasicMaterial({color:this.textBgColor,
	depthTest:false,depthWrite:false,side : THREE.DoubleSide } );
  this.material = options.material!== undefined ? options.material : defaultMaterial;
  
  this.lineMaterial = new GizmoLineMaterial( { color: 0x000000,depthTest:false,depthWrite:false, opacity:0.4, transparent:true, linewidth: 2 } );
  
  //this.setRadius(this.radius);
  this._generate();
}

ArcHelper.prototype = Object.create( BaseHelper.prototype );
ArcHelper.prototype.constructor = ArcHelper;  

ArcHelper.prototype._generate = function(){
	
	if(this.arcLine) this.remove( this.arcLine );
	
  //points.vertices.shift();
	if( this.mode == "line" ){
    var curve = new THREE.QuadraticBezierCurve3(
	    this.start,
	    this.mid,
	    this.end
    );
    var geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(50);
	  geometry.computeLineDistances();
    
    this.arcLine = new THREE.Line( geometry, this.lineMaterial );
    
    //TODO: auto set arrow positon;
    /*var arrowsSizeRadians = this.arrowSize * Math.PI/180;
    if(arrowsSizeRadians*2 > this.start.angleTo( this.end ) )
    {
    
    
    }*/
    //this.origin;
    //var offsetPoint = curve.getPointAt( this.arrowsLength );
    var midToEnd = this.end.clone().sub( this.mid );
    midToEnd.normalize();
    var rightArrowStart = this.end.clone().sub( midToEnd.clone().multiplyScalar( this.arrowsLength ) );
    this.rightArrow.setLength( this.arrowsLength, this.arrowsLength, this.arrowHeadWidth );
    this.rightArrow.setDirection( midToEnd );
    this.rightArrow.position.copy( rightArrowStart );
    
    var midToStart = this.start.clone().sub( this.mid );
    midToStart.normalize();
    var leftArrowStart = this.start.clone().sub( midToStart.clone().multiplyScalar( this.arrowsLength ) );
    this.leftArrow.setLength( this.arrowsLength, this.arrowsLength, this.arrowHeadWidth );
    this.leftArrow.setDirection( midToStart );
    this.leftArrow.position.copy( leftArrowStart );
    
    
	}else{
	  var circleShape = new THREE.Shape();
    circleShape.absarc( 0, 0, this.outerRadius, this.start, this.end, true );
	  circleShape.absarc( 0, 0, this.innerRadius, this.start, this.end,  false );
	  var points = circleShape.createPointsGeometry();
	}
	
	/*
	else if(this.mode == "outline"){
	  this.arcLine = new THREE.Line( points, this.lineMaterial );
	}
	else if(this.mode == "filled"){
	  var filledArcGeometry = new THREE.ShapeGeometry( circleShape, {curveSegments:30} );
	  this.arcLine = new THREE.Mesh( filledArcGeometry, this.material );
	  this.arcLine.renderDepth = 1e20;
	}*/
	
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

ArcHelper.prototype.setOrigin = function( origin ){
  this.origin = origin;
  this._generate();
}

ArcHelper.prototype.setStart = function( start ){
  this.start = start;
  this._generate();
}

ArcHelper.prototype.setMid = function( mid ){
  this.mid = mid;
  this._generate();
} 

ArcHelper.prototype.setEnd = function( end ){
  this.end = end;
  this._generate();
} 

ArcHelper.prototype.setStartAngle = function( startAngle ){
  this.startAngle = startAngle;
  this._generate();
}

ArcHelper.prototype.setEndAngle = function( endAngle ){
  this.endAngle = endAngle;
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



 
