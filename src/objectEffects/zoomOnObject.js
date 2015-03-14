
var ZoomInOnObject = function( options ) {
  var options = options || {};
  this.camera = options.camera === undefined ? undefined: options.camera;
  
  //this.object = null;
  //this.camerOriginalPos = null;
  //this.cameraTargetOriginalPos = null;
  //this.zoomTime = 0;
}

ZoomInOnObject.prototype = {
  constructor: ZoomInOnObject
};

ZoomInOnObject.prototype.execute = function( object , options){
  if(!object) return;
  //var scope = this;//TODO: this is temporary, until this "effect" is an object
  var options = options || {};
  
  var position    = options.position === undefined ? null: options.position;//to force a given "point " vector
  var orientation = options.orientation === undefined ? null: options.orientation;//to force a given "look at " vector
  var distance    = options.distance === undefined ? 3: options.distance;
  var zoomTime    = options.zoomTime === undefined ? 400: options.zoomTime;
  
  if(!position){
    distance = object.boundingSphere.radius*distance;
    position = object.position.clone();
  }else{
    distance = position.clone().sub( object.position ).length() * distance * 2 ;
  }
  
  var camera = this.camera;
  var camPos = camera.position.clone();
  var camTgt = camera.target.clone();
  var camTgtTarget =position.clone();
  
  var camPosTarget = camera.position.clone().sub( position ) ;
  
  //camera.target.copy( object.position );
  var camLookatVector = new THREE.Vector3( 0, 0, 1 );
  camLookatVector.applyQuaternion( camera.quaternion );
  camLookatVector.normalize();
  camLookatVector.multiplyScalar( distance );
  camLookatVector = position.clone().add( camLookatVector );
  
  camPosTarget = camLookatVector;
  
  var precision = 0.001;
  
  //Simply using vector.equals( otherVector) is not good enough 
  if(Math.abs(camPos.x - camPosTarget.x)<= precision &&
   (Math.abs(camPos.y - camPosTarget.y)<= precision) &&
   (Math.abs(camPos.z - camPosTarget.z)<= precision) )
  {
    //already at target, do nothing
    return;
  }   
  var tween = new TWEEN.Tween( camPos )
    .to( camPosTarget , zoomTime )
    .easing( TWEEN.Easing.Quadratic.In )
    .onUpdate( function () {
      camera.position.copy(camPos);   
    } )
    .start();
    var tween2 = new TWEEN.Tween( camTgt )
    .to( camTgtTarget , zoomTime )
    .easing( TWEEN.Easing.Quadratic.In )
    .onUpdate( function () {
      camera.target.copy(camTgt);   
    } )
    .start();
    //tween2.chain( tween );
    //tween2.start();
}

ZoomInOnObject.prototype.undo = function()
{
  
    var tween = new TWEEN.Tween( camPos )
    .to( camPosTarget , zoomTime )
    .easing( TWEEN.Easing.Quadratic.In )
    .onUpdate( function () {
      camera.position.copy(camPos);   
    } )
    .start();
    var tween2 = new TWEEN.Tween( tgtPos )
    .to( camTgtTarget, zoomTime )
    .easing( TWEEN.Easing.Quadratic.In )
    .onUpdate( function () {
      camera.target.copy(tgtPos);   
    } )
    .start();
}


//export ZoomInOnObject;
