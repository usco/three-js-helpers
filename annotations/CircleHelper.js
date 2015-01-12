/*
//TODO: make this into a mesh / geometry subclass
*/
CircleHelper = function(options)
{
  BaseHelper.call( this );
  
  var options = options || {}

  var position = options.position || new THREE.Vector3();
  
  var direction = this.direction = options.direction || new THREE.Vector3();
  this.color  = options.color!== undefined ? options.color : "#000";
  this.radius   = options.radius!== undefined ? options.radius : 10;
  
  var defaultMaterial = new THREE.LineBasicMaterial( { color: this.color, 
  depthTest:false, depthWrite:false,renderDepth : 1e20});
  this.material = options.material!== undefined ? options.material : defaultMaterial;
  
  this.setRadius(this.radius);
}

CircleHelper.prototype = Object.create( BaseHelper.prototype );
CircleHelper.prototype.constructor = CircleHelper;  

CircleHelper.prototype.setRadius = function( radius ){

  var circleRadius = this.radius = radius;; 
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  
  if(this.rCircle) this.remove( this.rCircle );
  
  this.rCircle = new THREE.Line(points, this.material );
  this.add( this.rCircle );
}  
