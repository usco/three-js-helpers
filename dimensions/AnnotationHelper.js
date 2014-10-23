/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
AnnotationHelper = function(diameter, distance, endLength, color)
{
  BaseHelper.call( this );

  this.distance = distance || 30;
  this.diameter = diameter || 20;
  this.endLength = endLength || 20;
  this.color = color || "#000000" ;
  this.text = this.diameter;

  var material = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false,depthWrite:false,renderDepth : 1e20});
 
  //center cross
  var centerCrossSize = 10;
  var centerCrossGeometry1 = new THREE.Geometry();
  centerCrossGeometry1.vertices.push( new THREE.Vector3( -centerCrossSize, 0, 0 ) );
  centerCrossGeometry1.vertices.push( new THREE.Vector3( centerCrossSize, 0, 0 ) );
  var centerCrossGeometry2 = new THREE.Geometry();
  centerCrossGeometry2.vertices.push( new THREE.Vector3( 0, -centerCrossSize, 0 ) );
  centerCrossGeometry2.vertices.push( new THREE.Vector3( 0, centerCrossSize, 0 ) );
  var centerCross1 = new THREE.Line( centerCrossGeometry1, material );
  var centerCross2 = new THREE.Line( centerCrossGeometry2, material );

  //draw arrow
  var arrowOffset = new THREE.Vector3(Math.sqrt(this.distance)*2+this.diameter/2,Math.sqrt(this.distance)*2+this.diameter/2,0);
  var mainArrow = new THREE.ArrowHelper2(new THREE.Vector3(-1,-1,0),new THREE.Vector3(),this.distance , this.color);
  mainArrow.position.add(arrowOffset);

  var endLineEndPoint = arrowOffset.clone().add( new THREE.Vector3( this.endLength, 0, 0 ) ) ;
  var endLineGeometry = new THREE.Geometry();
  endLineGeometry.vertices.push( arrowOffset );
  endLineGeometry.vertices.push( endLineEndPoint ); 
   var endLine = new THREE.Line( endLineGeometry, material );

  //draw dimention / text
  this.label = new THREE.TextDrawHelper().drawTextOnPlane(this.text,45);
  this.label.position.add( endLineEndPoint );
  //TODO: account for size of text instead of these hacks
  this.label.position.x += 5
  this.label.position.y -= 2
  
  
  //draw main circle
  var circleRadius = this.diameter/2;
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  var diaCircle = new THREE.Line(points, material );

  //add all
  this.add( diaCircle );
  this.add( mainArrow );
  this.add( endLine );
  this.add( this.label );
  this.add( centerCross1 );
  this.add( centerCross2 );
}

AnnotationHelper.prototype = Object.create( BaseHelper.prototype );
AnnotationHelper.prototype.constructor = AnnotationHelper;

