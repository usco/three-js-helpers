MirrorPlane = function (width, length, resolution, color, upVector) {

  THREE.Object3D.call( this );	
  this.width = width || 200;
  this.length = length || 200;
  this.resolution = resolution || 128;
  this.color = color ||  0x777777;
  this.upVector = upVector || new THREE.Vector3(0,1,0);
  
  this.userData.unselectable = true; // this should never be selectable
  this._drawPlane();
}
MirrorPlane.prototype = Object.create( THREE.Object3D.prototype );


MirrorPlane.prototype._drawPlane=function(){
  //create plane for shadow projection   
  var width = this.width;
  var length = this.length;

  var groundMirror = new THREE.Mirror( null, null, { clipBias: 0.003, textureWidth: this.resolution, textureHeight: this.resolution, color: this.color } );
  var planeGeometry = new THREE.PlaneBufferGeometry(width, length, 1, 1);
	var planeMaterial = groundMirror.material;

  //create plane for reflection
  this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
  this.plane.position.z = -0.8;
  this.plane.doubleSided = true;
  this.name = "MirrorPlane";
	this.plane.add( groundMirror );
  this.mirrorCamera = groundMirror;

  this.add(this.plane);
}


MirrorPlane.prototype.setUp = function(upVector) {
  this.upVector = upVector;
  this.up = upVector;
  this.lookAt(upVector);
};

