/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
DiameterHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};

  this.distance = options.distance || 30;
  this.diameter = options.diameter || 10;
  this.endLength = options.endLength || 20;
  this.color = options.color || "#000000" ;
  this.text = this.diameter;
  this.fontSize = options.fontSize || 20;

  var material = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false,depthWrite:false,renderDepth : 1e20});
 
  //center cross
  var centerCrossSize = 10;
  var centerCross = new CrossHelper({size:3});

  //leader line
  this.leaderLine = new LeaderLineHelper({text:"∅"+this.text,radius:this.diameter/2});
  
  //draw main circle
  var circleRadius = this.diameter/2;
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  var diaCircle = new THREE.Line(points, material );

  //add all
  this.add( centerCross );
  this.add( diaCircle );
  this.add( this.leaderLine );
  
}

DiameterHelper.prototype = Object.create( BaseHelper.prototype );
DiameterHelper.prototype.constructor = DiameterHelper;


