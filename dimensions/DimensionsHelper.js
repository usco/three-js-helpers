
ObjectDimensionsHelper = function (options) {
  BaseHelper.call( this );
  var options = options || {};
  var color = options.color || 0x000000;
  var mesh = options.mesh || this.parent || null;

  var cage = new THREE.Object3D()
  var lineMat = new THREE.MeshBasicMaterial({color: color, wireframe: true, shading:THREE.FlatShading});

  this.getBounds(mesh);
  var delta = this.computeMiddlePoint(mesh);
  cage.position = delta
  
  
  var width = this.width;
  var length = this.length;
  var height = this.height;
  console.log("w",width,"l",length,"h",height);

  var widthArrowPos = new THREE.Vector3(delta.x+this.length/2,delta.y,delta.z-this.height/2); 
  var lengthArrowPos = new THREE.Vector3( delta.x, delta.y+this.width/2, delta.z-this.height/2)
  var heightArrowPos = new THREE.Vector3( delta.x-this.length/2,delta.y+this.width/2,delta.z)

  //console.log("width", this.width, "length", this.length, "height", this.height,"delta",delta, "widthArrowPos", widthArrowPos)
  var dashMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5, gapSize: 2, depthTest: false,linewidth:1} )

  var baseOutlineGeometry = new THREE.Geometry();
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.computeLineDistances();

  var baseOutline = new THREE.Line( baseOutlineGeometry, dashMaterial, THREE.Lines );
  baseOutline.renderDepth = 1e20
  baseOutline.position.copy( new THREE.Vector3(delta.x,delta.y,delta.z-this.height/2) );
  this.add(baseOutline);

  baseCubeGeom = new THREE.BoxGeometry(this.length, this.width,this.height)
  var bla = new THREE.Mesh(baseCubeGeom,new THREE.MeshBasicMaterial({wireframe:true,color:0xff0000}))
  bla.position = new THREE.Vector3(delta.x,delta.y,delta.z);
  //this.add( bla )

  var sideLength =10;
  
  //length, sideLength, position, direction, color, text, textSize,
  var widthArrow  = new SizeHelper( {length:this.width,sideLength:sideLength,position:widthArrowPos,direction:new THREE.Vector3(0,0,-1) });
  var lengthArrow = new SizeHelper( {length:this.length,sideLength:sideLength,position:lengthArrowPos,direction:new THREE.Vector3(1,0,0) });
  var heightArrow = new SizeHelper( {length:this.height,sideLength:sideLength,position:heightArrowPos,direction:new THREE.Vector3(0,1,0) });
        
  this.add( widthArrow );
  this.add( lengthArrow );
  this.add( heightArrow );

}

ObjectDimensionsHelper.prototype = Object.create( BaseHelper.prototype );
ObjectDimensionsHelper.prototype.constructor = ObjectDimensionsHelper;

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
  if( !(mesh.boundingBox))
  {
    //TODO: "meshes" should have bounding box/sphere informations, not just shapes/geometries should have it
      mesh.boundingBox = computeObject3DBoundingBox(mesh);
  }
  //mesh.geometry.computeBoundingBox();
  var bbox = mesh.boundingBox;

  var length = ( (bbox.max.x-bbox.min.x).toFixed(2) )/1; // division by one to coerce to number
  var width  = ( (bbox.max.y-bbox.min.y).toFixed(2) )/1;
  var height = ( (bbox.max.z-bbox.min.z).toFixed(2) )/1;

  this.width = width;
  this.height = height;
  this.length = length;

  return [length,width, height];
}
          
