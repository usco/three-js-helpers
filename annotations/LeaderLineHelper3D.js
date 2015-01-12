/*
//FIXME: experimental , for 3D <->2D leader lines
*/
LeaderLineHelper3D = function(options)
{
  BaseHelper.call( this );
  var options = options || {};

  this.point = new THREE.Vector3();
  this.label = null;
  this.camera = null;
  
  this.armLength = 100;
  this.armOffset = 20;
  
  this.labelLeft = new THREE.Vector3();
  this.arrowEnd = new THREE.Vector3();
  
  this.set();
}

LeaderLineHelper3D.prototype = Object.create( BaseHelper.prototype );
LeaderLineHelper3D.prototype.constructor = LeaderLineHelper;

LeaderLineHelper3D.prototype.setPoint = function( point )
{
  this.point = point;
}

LeaderLineHelper3D.prototype.setLabel = function( label )
{
  this.label = label;
}

LeaderLineHelper3D.prototype.setCamera = function( camera )
{
  this.camera = camera;
}

LeaderLineHelper3D.prototype.set = function(  )
{
  this.leaderLine = new THREE.Object3D();
  
  var lineGeom = new THREE.Geometry();
  lineGeom.vertices.push( this.labelLeft );
  lineGeom.vertices.push( this.arrowEnd );
  
  this.armLine = new THREE.Line( lineGeom, new THREE.LineBasicMaterial( { color:0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20 } ),THREE.LinePieces );
    
  var lineGeom = new THREE.Geometry();
  lineGeom.vertices.push( this.point );
  lineGeom.vertices.push( this.arrowEnd );
  this.linkLine = new THREE.Line( lineGeom, new THREE.LineBasicMaterial( { color:0x000000,depthTest:false,depthWrite:false,renderDepth : 1e20 } ),THREE.LinePieces );
  
  var dir = this.point.clone().sub( this.arrowEnd );
  var length = dir.length();
  dir=dir.normalize();
  this.linkArrow = new THREE.ArrowHelper(dir, this.arrowEnd, length, 0x000000,4,1);
  

  
  this.leaderLine.add( this.armLine );
  this.leaderLine.add( this.linkLine );
  //this.leaderLine.add( this.linkArrow ); 
  
  this.pointCross = new CrossHelper({position:this.point});
  this.leaderLine.add( this.pointCross );
  
  this.add( this.leaderLine );
}
 /*var camera = this.$.cam.object;
      var label = this.$.leaderLineLabel;
      
      this.leaderLineTest = drawLeaderLine(camera, label, this.pickedPoint);
      this.addToScene( this.leaderLineTest, "helpers", {autoCenter:false,autoResize:false,select:false} );*/

LeaderLineHelper3D.prototype.update = function( )
{
  if(!this.label)return;
  var label = this.label;
  var camera = this.camera;
  var point  = this.point;
  var armOffset = this.armOffset;
  var armLength = this.armLength;
  camera.updateMatrixWorld( true );
  
  this.pointCross.position.copy( point );
  
  var vector = new THREE.Vector3();
  var xPos = (label.offsetLeft-armOffset) / window.innerWidth;
  var yPos = (label.offsetTop+5) / window.innerHeight;
  console.log("x,y",xPos, yPos);
  vector.set(
      ( xPos ) * 2 - 1,
      - ( yPos ) * 2 + 1,
      0.5 );
  vector.unproject( camera );
  
  var labelLeft = vector.clone();
    
  //compute 3d coords for offset
  var xPos = (label.offsetLeft-armLength-armOffset) / window.innerWidth;
  var yPos = (label.offsetTop+5) / window.innerHeight;
  vector.set(
      ( xPos ) * 2 - 1,
      - ( yPos ) * 2 + 1,
      0.5 );
  vector.unproject( camera );
    
  var arrowEnd = vector.clone();
  var armDir = labelLeft.clone().sub(arrowEnd).normalize();
    
  var dir = point.clone().sub( arrowEnd );
  var length = dir.length();
  dir=dir.normalize();
  
  
  this.linkArrow.setLength( length );
  this.linkArrow.setDirection( dir );
  
  this.armLine.geometry.vertices[0].copy( labelLeft );
  this.armLine.geometry.vertices[1].copy( arrowEnd );
  this.armLine.geometry.verticesNeedUpdate = true;
  
  
  this.linkLine.geometry.vertices[0].copy( point );
  this.linkLine.geometry.vertices[1].copy( arrowEnd );
  this.linkLine.geometry.verticesNeedUpdate = true;
  
  
  /*var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );*/
}

 
    
