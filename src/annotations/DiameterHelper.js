var {GizmoMaterial,GizmoLineMaterial} = require("../GizmoMaterial");
var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");

/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
  
  Two step interactive version : 
    - place center
    - place diameter
*/
DiameterHelper = function(options)
{
  AnnotationHelper.call( this );
  var options = options || {};

  this.distance = options.distance || 30;
  this.diameter = options.diameter || 10;
  this.endLength = options.endLength || 20;
  this.color = options.color || "#000000" ;
  
  this._position   = options.position !== undefined ? options.position : new THREE.Vector3();
  this.orientation = options.orientation !== undefined ? options.orientation : new THREE.Vector3();
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 8;
  this.fontFace   = options.fontFace!== undefined ? options.fontFace : "Jura";
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.centerColor = options.centerColor!== undefined ? options.centerColor : "#F00";
  this.crossColor  = options.crossColor!== undefined ? options.crossColor : "#F00";
  
  this.text   = options.text !== undefined ? options.text : this.diameter.toFixed(2);
  
   //FIXME: hack
  this.textColor = "#ff0077";
  this.arrowColor = this.textColor;
  this.centerColor = this.textColor;
  this.crossColor  = this.textColor;
  this.textBgColor = "rgba(255, 255, 255, 0)";
  
  //FIXME: this needs to be in all of the numerical measurement or not ? 
  this.tolerance = options.tolerance !== undefined ? options.tolerance : 0;
  
  
  this.lineMaterial = new GizmoLineMaterial( { color: this.centerColor,linewidth: 2});
  //depthTest:false, depthWrite:false,renderDepth : 1e20
 
  this.dimDisplayType = options.dimDisplayType!== undefined ? options.dimDisplayType : "offsetLine";
  this.centerCrossSize = 1.5;
  
  this.center = undefined;
  this.object = undefined;
  this.pointA = undefined;
  this.pointB = undefined;
  this.pointC = undefined;
  
  
  //initialise internal sub objects
  this.centerCross = new CrossHelper({size:this.centerCrossSize,color:this.centerColor});
  this.centerCross.hide();
  this.add( this.centerCross );
  
   //pointA cross
  this.pointACross = new CrossHelper({size:this.centerCrossSize,color:this.crossColor});
  this.pointACross.hide();
  this.add( this.pointACross );
    
   //pointB cross
  this.pointBCross = new CrossHelper({size:this.centerCrossSize,color:this.crossColor});
  this.pointBCross.hide();
  this.add( this.pointBCross );
  
   //pointC cross
  this.pointCCross = new CrossHelper({size:this.centerCrossSize,color:this.crossColor});
  this.pointCCross.hide();
  this.add( this.pointCCross );
  
  this.diaCircle = new CircleHelper({material : this.lineMaterial});
  this.diaCircle.hide();
  this.add( this.diaCircle );
  
  /*this.sizeArrow = new SizeHelper({
  fontSize: this.fontSize,
  textColor: this.textColor, textBgColor:this.textBgColor, labelType:this.labelType,
  arrowColor:this.textColor, 
  sideLineColor:this.textColor,
  textPrefix:"∅ ",
  });
  this.sizeArrow.hide();
  this.add( this.sizeArrow );*/
  
  //TODO: add settable swtich between size helper & leader line
  //leader line
  
  //var text = this.text; 
  var text = this.tolerance === 0 ? this.text : this.text+"±"+this.tolerance;
  //text:"∅"+this.text+"±0.15"
  
  this.leaderLine = new LeaderLineHelper({text:text,radius:this.diameter/2,
    fontSize:this.fontSize, 
    textColor: this.textColor, 
    textBgColor:this.textBgColor,
    labelType : this.labelType,
    arrowColor:this.textColor,
    linesColor:this.textColor
    });
  this.leaderLine.hide();
  this.add( this.leaderLine );
  
  
  if( options.center )   this.setCenter( options.center );
  if( options.diameter ) this.setDiameter( options.diameter );
  if( options.orientation ) this.setOrientation( options.orientation );
  
  this.setAsSelectionRoot( true );
  //FIXME: do this in a more coherent way
  this._setName();
}

DiameterHelper.prototype = Object.create( AnnotationHelper.prototype );
DiameterHelper.prototype.constructor = DiameterHelper;

DiameterHelper.prototype.set = function(){
  this.setCenter();
  this.setDiameter();
}

DiameterHelper.prototype.unset = function(){

  this.centerCross.hide();
  this.pointACross.hide();
  this.pointBCross.hide();
  this.pointCCross.hide();
  
  //this.sizeArrow.hide();
  this.leaderLine.hide();
  
  this.diaCircle.hide();
  
  this.position.copy( new THREE.Vector3() );
  this.setOrientation( new THREE.Vector3(0,0,1) );
}

DiameterHelper.prototype.setCenter = function( center, object ){
  if(center)  this.position.copy( center );
  if(center)  this.center = center;
  if(object)  this.object = object;
  
  this.centerCross.show();
  //FIXME: only needed if we do not offset this whole helper for positioning on the diam
  //this.centerCross.position.copy( this.center );
}

//for 3 point variant
DiameterHelper.prototype.setPointA = function( pointA, object ){
  if(pointA)  this.pointA = pointA;
  this.object = object;
  this.pointACross.position.copy( pointA );
  this.pointACross.show();
}

DiameterHelper.prototype.setPointB = function( pointB, object ){
  if(pointB)  this.pointB = pointB;
  this.object = object;
  this.pointBCross.position.copy( pointB );
  this.pointBCross.show();
}

DiameterHelper.prototype.setPointC = function( pointC, object ){
  if(pointC)  this.pointC = pointC;
  this.object = object;
  this.pointCCross.position.copy( pointC );
  this.pointCCross.show();
  
  this.setDataFromThreePoints();
}

DiameterHelper.prototype.setDiameter = function(diameter){
  if(!diameter && ! this.diameter){ 
    return
  }  
  this.diameter = diameter;
  this.text     = this.diameter.toFixed(2);
  
  //this.sizeArrow.setLength( this.diameter );
  //this.sizeArrow.setSideLength( this.diameter/2+10 );
  
  this.diaCircle.setRadius( this.diameter/2);
  
  //this.sizeArrow.show();
  this.leaderLine.show();
  
  this.diaCircle.show();
}

DiameterHelper.prototype.setRadius = function(radius){
  if(!radius && ! this.diameter){ 
    return
  }  
  this.setDiameter( radius*2 );
}

/*Sets the radius/diameter from one 3d point
*/
DiameterHelper.prototype.setRadiusPoint = function(point, normal){
  var radius = point.clone().sub( this.position ).length();
  this.setDiameter( radius*2 );
}

//compute center , dia/radius from three 3d points
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

DiameterHelper.prototype.setOrientation = function(orientation){
  this.orientation = orientation;
  //console.log("this.orientation",this.orientation);
  
  var defaultOrientation = new THREE.Vector3(0,0,1); 
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors ( defaultOrientation, this.orientation.clone() );
  this.rotation.setFromQuaternion( quaternion );
}


DiameterHelper.prototype._setName = function( ){
  var tmpValue = this.diameter;
  if( tmpValue ) tmpValue = tmpValue.toFixed( 2 );
  this.name = "Diameter: " + tmpValue;
}

module.exports = DiameterHelper;
