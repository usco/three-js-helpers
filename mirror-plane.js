MirrorPlane = function (width, length, shadowColor, upVector) {

  THREE.Object3D.call( this );	
  this.width = width || 200;
  this.length = length || 200;
  this.upVector = upVector || new THREE.Vector3(0,1,0);

  this._drawPlane();
}
MirrorPlane.prototype = Object.create( THREE.Object3D.prototype );


MirrorPlane.prototype._drawPlane=function(){
  //create plane for shadow projection   
  var width = this.width;
  var length = this.length;
  
  var mirrorCamera = new THREE.CubeCamera( 1,100,256) ;//0.1, 5000, 512 );
  //mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
  this.mirrorCamera = mirrorCamera;
  //scene.add( mirrorSphereCamera );

  var planeGeometry = new THREE.PlaneGeometry(-width, length, 5, 5);
	var planeMaterial = new THREE.MeshBasicMaterial( { envMap: mirrorCamera.renderTarget } );

  //create plane for shadow projection    
  this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
  this.plane.rotation.x = Math.PI;
  this.plane.position.z = -0.8;
  this.name = "MirrorPlane";
  //this.plane.receiveShadow = true;
  
  this.add(this.plane);
}


MirrorPlane.prototype.setUp = function(upVector) {
  this.upVector = upVector;
  this.up = upVector;
  this.lookAt(upVector);
};

