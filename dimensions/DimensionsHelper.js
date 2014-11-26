
ObjectDimensionsHelper = function (options) {
  BaseHelper.call( this );
  var options = options || {};
  var color = this.color = options.color || 0x000000;
  var mesh = options.mesh || this.parent || null;
  
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
}

ObjectDimensionsHelper.prototype = Object.create( BaseHelper.prototype );
ObjectDimensionsHelper.prototype.constructor = ObjectDimensionsHelper;


ObjectDimensionsHelper.prototype.attach = function(mesh){
  console.log("attaching");
  var color = this.color;
  var mesh = this.mesh = mesh;
  var lineMat = new THREE.MeshBasicMaterial({color: color, wireframe: true, shading:THREE.FlatShading});
  /*mesh.updateMatrixWorld();
  var matrixWorld = new THREE.Vector3();
  matrixWorld.setFromMatrixPosition( mesh.matrixWorld );
  this.position.copy( matrixWorld );*/

  this.getBounds(mesh);
  var delta = this.computeMiddlePoint(mesh);
  
  var width = this.width;
  var length = this.length;
  var height = this.height;
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
  var sideLength =10;
  
  //length, sideLength, position, direction, color, text, textSize,
  var widthArrow  = new SizeHelper( {length:this.width,sideLength:sideLength,
  position:widthArrowPos,direction:new THREE.Vector3(0,1,0), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType  });
  var lengthArrow = new SizeHelper( {length:this.length,sideLength:sideLength,
  position:lengthArrowPos,direction:new THREE.Vector3(-1,0,0), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType  });
  var heightArrow = new SizeHelper( {length:this.height,
  sideLength:sideLength,position:heightArrowPos,direction:new THREE.Vector3(0,0,1), 
  textBgColor:this.textBgColor, textColor:this.textColor, labelType:this.labelType });
  
  widthArrow.set();
  lengthArrow.set();
  heightArrow.set();
  
  this.arrows = new THREE.Object3D();
  this.arrows.add( widthArrow );
  this.arrows.add( lengthArrow );
  this.arrows.add( heightArrow );
  
  this.add( this.arrows );
  
  this.objectOriginalPosition = this.mesh.position.clone();
  this.position.copy( this.objectOriginalPosition );
}

ObjectDimensionsHelper.prototype.detach = function(mesh){
  console.log("detaching");
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

  this.width = width;
  this.height = height;
  this.length = length;

  return [length,width, height];
}
          
