
ObjectDimensionsHelper = function (options) {
  BaseHelper.call( this );
  var options = options || {};
  var color = this.color = options.color || 0x000000;
  var mesh = options.mesh || this.parent || null;
  
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  this.sideLength = options.sideLength!== undefined ? options.sideLength : 10; 
}

ObjectDimensionsHelper.prototype = Object.create( BaseHelper.prototype );
ObjectDimensionsHelper.prototype.constructor = ObjectDimensionsHelper;


ObjectDimensionsHelper.prototype.attach = function(mesh){
  var color = this.color;
  var mesh = this.mesh = mesh;
  var lineMat = new THREE.MeshBasicMaterial({color: color, wireframe: true, shading:THREE.FlatShading});
  /*mesh.updateMatrixWorld();
  var matrixWorld = new THREE.Vector3();
  matrixWorld.setFromMatrixPosition( mesh.matrixWorld );
  this.position.copy( matrixWorld );*/

  var dims   = this.getBounds(mesh);
  var length = this.length = dims[0];
  var width  = this.width  = dims[1];
  var height = this.height = dims[2];
  
  var delta = this.computeMiddlePoint(mesh);
  
  //console.log("w",width,"l",length,"h",height,delta);
  
  var baseCubeGeom = new THREE.BoxGeometry(this.length, this.width,this.height)
  this.meshBoundingBox = new THREE.Mesh(baseCubeGeom,new THREE.MeshBasicMaterial({wireframe:true,color:0xff0000}))
  //this.add( this.meshBoundingBox )

  var baseOutlineGeometry = new THREE.Geometry();
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.computeLineDistances();

  var baseOutline = new THREE.Object3D();
  
  var dashMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5, 
  gapSize: 2, depthTest: false,linewidth:1, opacity:0.2,transparent:true} );
  var baseOutlineBack = new THREE.Line( baseOutlineGeometry, dashMaterial, THREE.Lines );
  baseOutlineBack.renderDepth = 1e20
  baseOutlineBack.position.copy( new THREE.Vector3(delta.x,delta.y,delta.z-this.height/2) );
  
  var dashMaterial2 = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5,
   gapSize: 2, depthTest: true,linewidth:1} );
  var baseOutlineFront = baseOutlineBack.clone();
  baseOutlineFront.material = dashMaterial2;
  
  baseOutline.add(baseOutlineBack);
  baseOutline.add(baseOutlineFront);
  
  this.baseOutline = baseOutline; 
  this.add(baseOutline);
  

  var widthArrowPos = new THREE.Vector3(delta.x+this.length/2,delta.y,delta.z-this.height/2); 
  var lengthArrowPos = new THREE.Vector3( delta.x, delta.y+this.width/2, delta.z-this.height/2)
  var heightArrowPos = new THREE.Vector3( delta.x-this.length/2,delta.y+this.width/2,delta.z)
  //console.log("width", this.width, "length", this.length, "height", this.height,"delta",delta, "widthArrowPos", widthArrowPos)
  var sideLength = this.sideLength;
  
  //length, sideLength, position, direction, color, text, textSize,
  this.widthArrow  = new SizeHelper( {length:this.width,sideLength:sideLength,
  position:widthArrowPos,direction:new THREE.Vector3(0,1,0), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType  });
  this.lengthArrow = new SizeHelper( {length:this.length,sideLength:sideLength,
  position:lengthArrowPos,direction:new THREE.Vector3(-1,0,0), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType  });
  this.heightArrow = new SizeHelper( {length:this.height,
  sideLength:sideLength,position:heightArrowPos,direction:new THREE.Vector3(0,0,1), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType });
  
  
  this.arrows = new THREE.Object3D();
  this.arrows.add( this.widthArrow );
  this.arrows.add( this.lengthArrow );
  this.arrows.add( this.heightArrow );
  
  this.add( this.arrows );
  
  this.objectOriginalPosition = this.mesh.position.clone();
  var offsetPosition = this.objectOriginalPosition.clone().sub(
    new THREE.Vector3(0,0,this.height/2 ) );
  this.position.copy( offsetPosition );
}

ObjectDimensionsHelper.prototype.detach = function(mesh){
  this.mesh = null;
  //this.remove( this.meshBoundingBox );
  this.remove( this.baseOutline );
  this.remove( this.arrows );
  
  this.objectOriginalPosition = new THREE.Vector3();
  this.position.copy( new THREE.Vector3() );
}

ObjectDimensionsHelper.prototype.update = function(){
  var foo = this.mesh.position.clone().sub( this.objectOriginalPosition );
  this.position.add( foo );
  this.objectOriginalPosition = this.mesh.position.clone();
  
  //check if scale update is needed
 var dims = this.getBounds(this.mesh);
 if( this.length != dims[0] || this.width != dims[1] || this.height != dims[2] )
 {
    var mesh = this.mesh;
    this.width  = dims[1];
    this.length = dims[0];
    this.height = dims[2];
    
    var delta = this.computeMiddlePoint(mesh);
    this.widthArrow.setLength(this.width);
    this.lengthArrow.setLength(this.length);
    this.heightArrow.setLength(this.height);
 }
  
}

ObjectDimensionsHelper.prototype.computeMiddlePoint=function(mesh)
{
  var middle  = new THREE.Vector3()
  middle.x  = ( mesh.boundingBox.max.x + mesh.boundingBox.min.x ) / 2;
  middle.y  = ( mesh.boundingBox.max.y + mesh.boundingBox.min.y ) / 2;
  middle.z  = ( mesh.boundingBox.max.z + mesh.boundingBox.min.z ) / 2;
  //console.log("mid",geometry.boundingBox.max.z,geometry.boundingBox.min.z, geometry.boundingBox.max.z+geometry.boundingBox.min.z)
  return middle;
}

ObjectDimensionsHelper.prototype.getBounds=function(mesh)
{
  var bbox = new THREE.Box3().setFromObject( mesh );

  var length = ( (bbox.max.x-bbox.min.x).toFixed(2) )/1; // division by one to coerce to number
  var width  = ( (bbox.max.y-bbox.min.y).toFixed(2) )/1;
  var height = ( (bbox.max.z-bbox.min.z).toFixed(2) )/1;

  return [length,width, height];
}
          
