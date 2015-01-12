/*

*/
LeaderLineHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};

  this.distance = options.distance || 30;
  this.color = options.color || "#000000" ;
  this.text = options.text !== undefined ? options.text : " ";
  
  
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  this.linesColor = options.linesColor !== undefined ? options.linesColor : 0x000000;
  this.lineWidth  = options.lineWidth !== undefined ? options.lineWidth : 1;
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelType  = options.labelType!== undefined ? options.labelType : "frontFacing";
  
  var angle = options.angle !== undefined ? options.angle : 45;
  var radius = options.radius !== undefined ? options.radius : 0;
  var angleLength = options.angleLength || 20; 
  var horizLength = options.horizLength || 10;
  var textBorder = options.textBorder || null;

  var material = new THREE.LineBasicMaterial( { color: this.linesColor, depthTest:false,depthWrite:false});
 
  var rAngle = angle;
  rAngle = rAngle*Math.PI/180;
  var y = Math.cos( rAngle )*angleLength;
  var x = Math.sin( rAngle )*angleLength;
  var angleEndPoint = new THREE.Vector3( x,y,0 );
  angleEndPoint = angleEndPoint.add( angleEndPoint.clone().normalize().multiplyScalar( radius ) );
  var angleArrowDir = angleEndPoint.clone().normalize();
  angleEndPoint.x = -angleEndPoint.x;
  angleEndPoint.y = -angleEndPoint.y;
  
  this.angleArrow = new THREE.ArrowHelper(angleArrowDir, angleEndPoint, angleLength,this.color,4,2);
  this.angleArrow.scale.z =0.1;
  
  //var endLineEndPoint = arrowOffset.clone().add( new THREE.Vector3( this.endLength, 0, 0 ) ) ;
  
  var horizEndPoint = angleEndPoint.clone();
  horizEndPoint.x -= horizLength;
  
  var horizGeom = new THREE.Geometry();
  horizGeom.vertices.push( angleEndPoint );
  horizGeom.vertices.push( horizEndPoint );
  
  this.horizLine = new THREE.Line( horizGeom, material );
  this.horizLine.renderDepth = 1e20;
  
  //draw dimention / text
  switch(this.labelType)
  {
    case "flat":
      this.label = new LabelHelperPlane({text:this.text,fontSize:this.fontSize,background:(this.textBgColor!=null),bgColor:this.textBgColor});
    break;
    case "frontFacing":
      this.label = new LabelHelper3d({text:this.text,fontSize:this.fontSize,bgColor:this.textBgColor});
    break;
  }
  this.label.rotation.z = Math.PI;
  var labelSize=this.label.width/2 + 2 //label size, plus some extra
  var labelPosition = horizEndPoint.clone().sub(new THREE.Vector3(labelSize,0,0))
  this.label.position.add( labelPosition );
  
 
  var crossHelper = new CrossHelper({size:3});
  this.add( crossHelper );
  
  if(textBorder)
  {
    if(textBorder == "circle")
    {
      var textBorderGeom = new THREE.CircleGeometry( labelSize, 30 );
      textBorderGeom.vertices.shift();
      var textBorderOutline = new THREE.Line( textBorderGeom, material ); 
      textBorderOutline.position.add( labelPosition );
      this.add( textBorderOutline );
    }
  }
 
  this.add( this.angleArrow );
  this.add( this.horizLine );
  this.add( this.label );
  
  //material settings : FIXME, move this elsewhere
  this.arrowLineMaterial = new THREE.LineBasicMaterial({color:this.arrowColor, linewidth:this.lineWidth,linecap:"miter",depthTest:false,depthWrite:false});
  this.arrowConeMaterial = new THREE.MeshBasicMaterial({color:this.arrowColor, 
depthTest:false, depthWrite:false});
  
  this.angleArrow.line.material = this.arrowLineMaterial;
  this.angleArrow.cone.material =  this.arrowConeMaterial;
  this.angleArrow.renderDepth = 1e20;
  
}

LeaderLineHelper.prototype = Object.create( BaseHelper.prototype );
LeaderLineHelper.prototype.constructor = LeaderLineHelper;
