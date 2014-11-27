/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
NoteHelper = function(options)
{
  BaseHelper.call( this );

  var options = options || {};
  /*this.distance = distance || 30;
  this.diameter = diameter || 20;
  this.endLength = endLength || 20;
  this.color = color || "#000000" ;
  this.text = this.diameter;*/
  
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.crossColor = options.crossColor!== undefined ? options.crossColor : "#F00";
  
  /*
  var material = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false,depthWrite:false,renderDepth : 1e20});

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
  this.label = new LabelHelper3d({text:this.text,fontSize:this.fontSize, color:this.textColor, bgColor:this.textBgColor});
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
  this.add( centerCross1 );*/
  
  this.point = undefined;
  this.object= undefined;
}

NoteHelper.prototype = Object.create( BaseHelper.prototype );
NoteHelper.prototype.constructor = NoteHelper;


NoteHelper.prototype.unset = function( ){
  this.remove( this.pointCross );
}

NoteHelper.prototype.setPoint = function( point, object ){
  if(point) this.point = point;
  if(object) this.object = object;

  if(this.pointCross) this.remove( this.pointCross );
  //point location cross
  this.pointCross = new CrossHelper({size:this.centerCrossSize,color:this.crossColor});
  this.pointCross.position.copy( this.point );
  this.add( this.pointCross );
}

