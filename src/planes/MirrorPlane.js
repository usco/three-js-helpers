import { THREE_Mirror } from "./Mirror"

class MirrorPlane extends THREE.Object3D{

  constructor (width, length, resolution, color, upVector) {
    super();
    this.width = width || 200;
    this.length = length || 200;
    this.resolution = resolution || 128;
    this.color = color ||  0x777777;
    this.upVector = upVector || new THREE.Vector3(0,1,0);
    
    this.userData.unselectable = true; // this should never be selectable
    this._drawPlane();
  }

  _drawPlane(){
    //create plane for shadow projection   
    var width = this.width;
    var length = this.length;

    var groundMirror = new THREE_Mirror( null, null, { clipBias: 0.003, textureWidth: this.resolution, textureHeight: this.resolution, color: this.color } );
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


  setUp(upVector) {
    this.upVector = upVector;
    this.up = upVector;
    this.lookAt(upVector);
  }
}

//export { MirrorPlane };
module.exports = MirrorPlane;

