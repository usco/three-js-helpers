
var BaseOutline = function(length, width, midPoint){
  THREE.Object3D.call(this);
  this.width = width;
  this.length = length;
  
  //TODO: replace with buffer geometry
  
  var baseOutlineGeometry = new THREE.Geometry();
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, -this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, this.width/2, 0));
  baseOutlineGeometry.vertices.push(new THREE.Vector3(-this.length/2, -this.width/2, 0));
  baseOutlineGeometry.computeLineDistances();

  
  var dashMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5, 
  gapSize: 2, depthTest: false,linewidth:1, opacity:0.2,transparent:true} );
  var baseOutlineBack = new THREE.Line( baseOutlineGeometry, dashMaterial, THREE.Lines );
  baseOutlineBack.renderDepth = 1e20
  baseOutlineBack.position.copy( new THREE.Vector3( midPoint.x, midPoint.y, midPoint.z-this.height/2) );
  
  var dashMaterial2 = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 2.5,
   gapSize: 2, depthTest: true,linewidth:1} );
  var baseOutlineFront = baseOutlineBack.clone();
  baseOutlineFront.material = dashMaterial2;
  
  this.add(baseOutlineBack);
  this.add(baseOutlineFront);
  this.baseOutlineBack  = baseOutlineBack;
  this.baseOutlineFront = baseOutlineFront;
  //THREE.Mesh.call(this, geometry, material);
}

BaseOutline.prototype = Object.create( THREE.Object3D.prototype );
BaseOutline.prototype.constructor = BaseOutline;

BaseOutline.prototype._updateGeometries = function(){
  
  var geoms = [this.baseOutlineBack.geometry,this.baseOutlineFront.geometry];

  for(var i=0; i<geoms.length;i++)
  {
    var geom = geoms[i];
    geom.vertices[0].copy( new THREE.Vector3(-this.length/2, -this.width/2, 0) );
    geom.vertices[1].copy(new THREE.Vector3(this.length/2, -this.width/2, 0));
    geom.vertices[2].copy(new THREE.Vector3(this.length/2, this.width/2, 0));
    geom.vertices[3].copy(new THREE.Vector3(-this.length/2, this.width/2, 0));
    geom.vertices[4].copy(new THREE.Vector3(-this.length/2, -this.width/2, 0));
    
    geom.dynamic = true;
    geom.verticesNeedUpdate = true;
  }
  
  //mesh.geometry.verticesNeedUpdate = true;
}

BaseOutline.prototype.setWidth = function( width ){
  this.width = width;
  this._updateGeometries();
}

BaseOutline.prototype.setLength = function( length ){
  this.length = length;
  this._updateGeometries();
}

module.exports = BaseOutline;
