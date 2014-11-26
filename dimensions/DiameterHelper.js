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
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.text   = options.text !== undefined ? options.text : this.diameter.toFixed(2);
  
  this.lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, depthTest:false, depthWrite:false,renderDepth : 1e20});
 
  this.dimDisplayType = options.dimDisplayType!== undefined ? options.dimDisplayType : "offsetLine";
  this.centerCrossSize = 1.5;
  
  this.center = undefined;
  this.object = undefined;
  this.pointA = undefined;
  this.pointB = undefined;
  this.pointC = undefined;
  
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
  this.remove( this.dimensionHelper );
  
  if(this.pointACross) this.remove( this.pointACross );
  if(this.pointBCross) this.remove( this.pointBCross );
  if(this.pointCCross) this.remove( this.pointCCross );
  
  this.position.copy( new THREE.Vector3() );
}

DiameterHelper.prototype.setCenter = function( center, object ){
  if(center)  this.position.copy( center );
  if(center)  this.center = center;
  this.object = object;
  
  if(this.centerCross) this.remove( this.centerCross );
   //center cross
  this.centerCross = new CrossHelper({size:this.centerCrossSize});
  this.add( this.centerCross );
}

//for 3 point variant
DiameterHelper.prototype.setPointA = function( pointA, object ){
  if(pointA)  this.pointA = pointA;
  this.object = object;
  
  if(this.pointACross) this.remove( this.pointACross );
   //pointA cross
  this.pointACross = new CrossHelper({size:this.centerCrossSize});
  this.pointACross.position.copy( pointA );
  this.add( this.pointACross );
}

DiameterHelper.prototype.setPointB = function( pointB, object ){
  if(pointB)  this.pointB = pointB;
  this.object = object;
  
  if(this.pointBCross) this.remove( this.pointBCross );
   //pointB cross
  this.pointBCross = new CrossHelper({size:this.centerCrossSize});
  this.pointBCross.position.copy( pointB );
  this.add( this.pointBCross );
}

DiameterHelper.prototype.setPointC = function( pointC, object ){
  if(pointC)  this.pointC = pointC;
  this.object = object;
  
  if(this.pointCCross) this.remove( this.pointCCross );
   //pointC cross
  this.pointCCross = new CrossHelper({size:this.centerCrossSize});
  this.pointCCross.position.copy( pointC );
  this.add( this.pointCCross );
  
  this.setDataFromThreePoints();
}

//compute center , dia/radius from three points
DiameterHelper.prototype.setDataFromThreePoints = function(){
   var plane = new THREE.Plane().setFromCoplanarPoints( this.pointA, this.pointB, this.pointC );

   var center = new THREE.Vector3();
   var pointA = this.pointA;
   var pointB = this.pointB;
   var pointC = this.pointC;
   
   //see http://en.wikipedia.org/wiki/Circumscribed_circle
   // triangle "edges"
   var t = pointA.clone().sub( pointB );
   var u = pointB.clone().sub( pointC );
   var v = pointC.clone().sub( pointA );
   var m = pointA.clone().sub( pointC );
   var x = pointB.clone().sub( pointA );
   var z = pointC.clone().sub( pointB );
   
   var foo = t.clone().cross( u ).length()
   var bar = 2 * foo
   var baz = foo * foo;
   var buu = 2 * baz;
   
   var radius = ( t.length()*u.length()*v.length() )/ bar
   //console.log("radius",radius);
   
   var alpha = ( u.lengthSq() * t.clone().dot( m ) ) / buu;
   var beta  = ( m.lengthSq() * x.clone().dot( u ) ) / buu;
   var gamma = ( t.lengthSq() * v.clone().dot( z ) ) / buu;
   
   var center = pointA.clone().multiplyScalar( alpha ).add( 
     pointB.clone().multiplyScalar( beta ) ) .add(
     pointC.clone().multiplyScalar( gamma ) );
   //console.log("center", center);
   
   this.setOrientation( plane.normal );
   this.setCenter( center );
   this.setRadius( radius );
   
   this.pointACross.position.copy( this.pointA.clone().sub( this.position ) );
   this.pointBCross.position.copy( this.pointB.clone().sub( this.position ) );
   this.pointCCross.position.copy( this.pointC.clone().sub( this.position ) );
   
   /*(x1-center.x)^2 + (y1-center.y)^2 = r^2
   (x2-center.x)^2 + (y2-center.y)^2 = r^2
   (x3-center.x)^2 + (y3-center.y)^2 = r^2*/
   
   //for a Circle of radius r , center C=(Cx,cy,cz) , and normal vector n (X is the cross product). 
   
   //Here, u is any unit vector perpendicular to n. Since there are an infinite number of 
   //vectors perpendicular to n, using a parametrized n is helpful. If the orientation is specified by a zenith angle  and azimuth , then , , and  can have simple forms:
   //P(t) = r*cos(t)*u + r*sin(t)*n X u+ C;
   //see here for more infos :http://mathematica.stackexchange.com/questions/16209/how-to-determine-the-center-and-radius-of-a-circle-given-three-points-in-3d
   
   /*v1 = p2 - p1;
    v2 = p3 - p1;
    {v1, v2} = Orthogonalize[{v1, v2}];
    n = Cross[v1, v2];
    eqs = {
     (x - x1)^2 + (y - y1)^2 + (z - z1)^2 == r^2,
     (x - x2)^2 + (y - y2)^2 + (z - z2)^2 == r^2,
     (x - x3)^2 + (y - y3)^2 + (z - z3)^2 == r^2,
     n.({x, y, z} - p1) == 0
    };
    */
    //P: center
    //all points are on the circle
    //var PA = PB = PC;
    
    /*var v1 = pointB.clone().sub( pointA );
    var v2 = pointC.clone().sub( pointA );
    var n = new THREE.Vector3().crossVectors( v1, v2 );
    
    var PA = (x - x1)^2 + (y - y1)^2 + (z - z1)^2 == r^2,
    var PB = (x - x2)^2 + (y - y2)^2 + (z - z2)^2 == r^2,
    var PC = (x - x3)^2 + (y - y3)^2 + (z - z3)^2 == r^2,
    //var eq4 = n.({x, y, z} - p1) == 0;*/
    
    // triangle "edges"
    /*var t = pointB.clone().sub( pointA );
    var u = pointC.clone().sub( pointA );
    var v = pointC.clone().sub( pointB );
    
    // triangle normal
    var w = new THREE.Vector3().crossVectors( t, u );
    var wsl = w.lengthSq();

    return;
    if (wsl<10e-14) return false; // area of the triangle is too small (you may additionally check the points for colinearity if you are paranoid)

    // helpers
    var iwsl2 = 1.0 / (2.0*wsl);
    var tt = t.clone().dot( t );//new THREE.Vector3().multiplyVectors(t,t);
    var uu = u.clone().dot( u );//new THREE.Vector3().multiplyVectors(u,u);
    var vv = v.clone().dot( v );
    var uv = new THREE.Vector3().multiplyVectors(u,v);
    var tv = new THREE.Vector3().multiplyVectors(t,v);
    

    // result circle
    Vector3d circCenter = p1 + (u*tt*(u*v) - t*uu*(t*v)) * iwsl2;
    //double   circRadius = sqrt(tt * uu * (v*v) * iwsl2*0.5);
    //Vector3d circAxis   = w / sqrt(wsl);
    
    
    var circCenter =  pointA.clone.add(  u.clone().multiply( tt ).multiply( uv ).sub( t.clone().multiply( uu ).multiply( tv ) ) ).multiplyScalar( iwsl2);
    this.setCenter( circCenter );
    
    var circRadius = Math.sqrt( tt*uu*vv * iwsl2*0.5);
    var circAxis   = w.divideScalar( Math.sqrt(wsl) );*/
    
}


DiameterHelper.prototype.setDiameter = function(diameter){
  if(!diameter && ! this.diameter){ 
    return
  }  
  this.diameter = diameter;
  this.text     = this.diameter.toFixed(2);
  
  this.drawCircle();
  this.drawDimension();
}

DiameterHelper.prototype.setRadius = function(radius){
  if(!radius && ! this.diameter){ 
    return
  }  
  this.setDiameter( radius*2 );
}

/*Allows setting the radius/diameter from a 3d point

*/
DiameterHelper.prototype.setRadiusPoint = function(point, normal){
  
  var radius = point.clone().sub( this.position ).length();
  //var plane = new THREE.Plane().setFromCoplanarPoints( this.end, this.mid, this.start );
  this.setDiameter( radius*2 );
}

DiameterHelper.prototype.setOrientation = function(orientation){
  this.orientation = orientation;
  console.log("this.orientation",this.orientation);
  
  var defaultOrientation = new THREE.Vector3(0,0,1); 
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors ( defaultOrientation, this.orientation.clone() );
  this.rotation.setFromQuaternion( quaternion );
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

DiameterHelper.prototype.drawDimension = function(){

  console.log("drawDimension");
  switch(this.dimDisplayType)
  {
    case "leaderLine":
      this.drawLeaderLine();
    break;
    case "offsetLine":
      this.drawOffsetLine();
    break;
  }
}

DiameterHelper.prototype.drawLeaderLine = function(){
  //leader line
  this.dimensionHelper = new LeaderLineHelper({text:"∅"+this.text,radius:this.diameter/2,
  fontSize:this.fontSize, textColor: this.textColor, textBgColor:this.textBgColor});
  
  if(this.dimensionHelper) this.remove( this.dimensionHelper );
  this.add( this.dimensionHelper );
}

DiameterHelper.prototype.drawOffsetLine = function(){
  //offset line
  console.log("textColor",this.textColor);
  this.dimensionHelper = new SizeHelper({length:this.diameter, 
  textColor: this.textColor, textBgColor:this.textBgColor, labelType:"frontFacing",sideLength:this.diameter/2+10
  });
  this.dimensionHelper.set();
  
  if(this.dimensionHelper) this.remove( this.dimensionHelper );
  this.add( this.dimensionHelper );
}

