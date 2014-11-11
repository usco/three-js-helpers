/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
  
  Two step interactive version : 
    - place center
    - place diameter
*/
DiameterHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};

  this.distance = options.distance || 30;
  this.diameter = options.diameter || 10;
  this.endLength = options.endLength || 20;
  this.color = options.color || "#000000" ;
  
  this._position   = options.position !== undefined ? options.position : new THREE.Vector3();
  this.orientation = options.orientation !== undefined ? options.orientation : new THREE.Vector3();
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.text   = options.text !== undefined ? options.text : this.diameter.toFixed(2);
  
  this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false, depthWrite:false,renderDepth : 1e20});
 
}

DiameterHelper.prototype = Object.create( BaseHelper.prototype );
DiameterHelper.prototype.constructor = DiameterHelper;

DiameterHelper.prototype.set = function(){
  this.setCenter();
  this.setDiameter();
}

DiameterHelper.prototype.unset = function(){
  this.remove( this.centerCross );
  this.remove( this.diaCircle );
  this.remove( this.leaderLine );
}

DiameterHelper.prototype.setCenter = function(centerPosition){
  if(centerPosition)  this.position.copy( centerPosition );
  if(this.centerCross) this.remove( this.centerCross );
   //center cross
  this.centerCross = new CrossHelper({size:this.centerCrossSize});
  this.add( this.centerCross );
}

DiameterHelper.prototype.setDiameter = function(diameter){
  if(!diameter && ! this.diameter){ 
    return
  }  
  this.diameter = diameter;
  this.text     = this.diameter.toFixed(2);
  
  this.drawCircle();
  this.drawLeaderLine();
}

DiameterHelper.prototype.setRadius = function(radius){
  if(!radius && ! this.diameter){ 
    return
  }  
  this.diameter = radius*2;
  this.text     = this.diameter.toFixed(2);
  
  this.drawCircle();
  this.drawLeaderLine();
}

DiameterHelper.prototype.setOrientation = function(orientation){
  this.orientation = orientation;
  console.log("this.orientation",this.orientation);
  
  var defaultOrientation = new THREE.Vector3(0,0,1); 
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors ( defaultOrientation, this.orientation.clone() );
  this.rotation.setFromQuaternion( quaternion );
}

/*Allows setting the radius/diameter from a 3d point

*/
DiameterHelper.prototype.setRadiusPoint = function(point, normal){
  
  var radius = point.clone().sub( this.position ).length();
  //var plane = new THREE.Plane().setFromCoplanarPoints( this.end, this.mid, this.start );
  this.diameter = radius*2;
  this.text     = this.diameter.toFixed(2);
  
  this.drawCircle();
  this.drawLeaderLine();
}


DiameterHelper.prototype.drawCircle = function(){
  //draw main circle
  var circleRadius = this.diameter/2;
  var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, 0 );
	circleShape.absarc( 0, 0, circleRadius, 0, Math.PI*2, false );
  var points  = circleShape.createSpacedPointsGeometry( 100 );
  this.diaCircle = new THREE.Line(points, this.lineMaterial );
  
  if(this.diaCircle) this.remove( this.diaCircle );
  this.add( this.diaCircle );
}

DiameterHelper.prototype.drawLeaderLine = function(){
  //leader line
  this.leaderLine = new LeaderLineHelper({text:"∅"+this.text,radius:this.diameter/2,
  fontSize:this.fontSize,textBgColor:this.textBgColor});
  
  if(this.leaderLine) this.remove( this.leaderLine );
  this.add( this.leaderLine );
}



