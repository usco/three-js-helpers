//FIXME: hack 
THREE.Vector3.prototype.pickingRay = function ( camera ) {
            var tan = Math.tan( 0.5 * THREE.Math.degToRad( camera.fov ) ) / camera.zoom;

            this.x *= tan * camera.aspect;
            this.y *= tan; 
            this.z = - 1;

            return this.transformDirection( camera.matrixWorld );
        };


GizmoMaterial = function ( parameters ) {

		THREE.MeshBasicMaterial.call( this );

		this.depthTest = false;
		this.depthWrite = false;
		this.side = THREE.FrontSide;
		this.transparent = true;

		this.setValues( parameters );

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

					this.color.copy( this.oldColor );
					this.opacity = this.oldOpacity;

			}

		};

};

GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );


CubeCorner = function( size, width, position ){
  var size = size || 10;
  var width = width || 4;
  var position = position || new THREE.Vector3();

  var planeGeometry = new THREE.PlaneGeometry( size, width, 2, 2 );
  planeGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI/2 ) ); 
  planeGeometry.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI/2 ) ); 
  planeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( -width /2, 0 ,size /2 ) );
  
  var planeGeometry2 = planeGeometry.clone();
  planeGeometry2.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI/2 ) ); 
  
  //final geometry
  var geometry = new THREE.Geometry();
  geometry.merge(planeGeometry);
  geometry.merge(planeGeometry2);
  
  var material = new GizmoMaterial( { color:0xFF0000, 
	  transparent:true, opacity:0.5, side : THREE.DoubleSide,
	  depthTest:false } );
  
  THREE.Mesh.call(this, geometry, material);
  this.position.copy( position );
}

CubeCorner.prototype = Object.create( THREE.Mesh.prototype );
CubeCorner.prototype.constructor = CubeCorner;  



ViewCubeGizmo = function( size, width, position ){
  THREE.Object3D.call( this );
  
  var size = size || 10;
  var width = width || 4;
  var position = position || new THREE.Vector3();

  var viewCube = new THREE.Mesh(new THREE.BoxGeometry( size, size, size ), 
    new GizmoMaterial( {color:0xFFFF00, transparent:true, opacity:0} ) );
  viewCube.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0 ,size /2 ) );


  this.position.copy( position );
}

ViewCubeGizmo.prototype = Object.create( THREE.Object3D.prototype );
ViewCubeGizmo.prototype.constructor = ViewCubeGizmo;  


ViewCubeGizmo.prototype.hide = function () {
	this.traverse(function( child ) {
		child.visible = false;
	});
};

ViewCubeGizmo.prototype.show = function () {
	this.traverse(function( child ) {
		child.visible = true;
		if (child.parent == scope.pickers ) child.visible = showPickers;
		if (child.parent == scope.planes ) child.visible = false;
	});
	this.activePlane.visible = showActivePlane;
};

ViewCubeGizmo.prototype.highlight = function ( item ) {
	this.traverse(function( child ) {
		if ( child.material && child.material.highlight ){
			if ( child.name == item ) {
				child.material.highlight( true );
			} else {
				child.material.highlight( false );
			}
		}
	});
};

 
CamViewControls = function (size, xColor, yColor, zColor, textColor, addLabels, addArrows) { 
	 THREE.Object3D.call( this );
	
	 var size = 12;
	 var cornerWidth = 2;
	 var viewCube = new THREE.Mesh(new THREE.BoxGeometry( size, size, size ), 
	 new THREE.MeshBasicMaterial( {color:0xFFFF00, transparent:true, opacity:0} ) );
	 viewCube.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0 ,size /2 ) );
	 viewCube.name = "ViewCube";
	 
	 var frontLeftCorner = new CubeCorner( size, cornerWidth, 
	  new THREE.Vector3( size/2,-size/2,0) );
	 frontLeftCorner.rotation.z -= Math.PI/2;
	 frontLeftCorner.name="frontLeftCorner";
	 
	  var frontRightCorner = new CubeCorner( size, cornerWidth, 
	  new THREE.Vector3( size/2,size/2,0) );
	 frontRightCorner.name="frontRightCorner";
	 
	 this.pickers = pickers = new THREE.Object3D();
	 
	 
	 this.viewCubeGizmo = new ViewCubeGizmo();
	 this.viewCubeGizmo.add( frontLeftCorner );
	 this.viewCubeGizmo.add( frontRightCorner );
	 
	 
	 //this.add( this.pickers );
	 
	 this.add( this.viewCubeGizmo );
	
	/*this.pickerGizmos = {
	  XY: [
				[ new THREE.Mesh( new THREE.PlaneGeometry( 0.4, 0.4 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.2, 0.2, 0 ] ]
			],
	 };*/
	 
	 //// PLANES

	var planeGeometry = new THREE.PlaneBufferGeometry( size, size, 2, 2 );
	var planeMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
	planeMaterial.side = THREE.DoubleSide;
	 
	 var planes = {
			"XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
			"YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
			"XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
		};
		
		
}

CamViewControls.prototype = Object.create( THREE.Object3D.prototype );
CamViewControls.prototype.constructor = CamViewControls;  

CamViewControls.prototype.init = function( camera, domElement ){
  console.log("attaching CamViewControls controls to", domElement);
  this.domElement = domElement;
  this.camera = camera;
  
  var scope = this;
  
  var ray = new THREE.Raycaster();
	var pointerVector = new THREE.Vector3();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();
	
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Euler();
	
	this.camPosition = camPosition;
	this.camRotation = camRotation;
  
  /*domElement.addEventListener( "mousedown", onPointerDown, false );
	domElement.addEventListener( "touchstart", onPointerDown, false );

	domElement.addEventListener( "mousemove", onPointerHover, false );
	domElement.addEventListener( "touchmove", onPointerHover, false );*/

	domElement.addEventListener( "mousemove", onPointerMove, false );
	domElement.addEventListener( "touchmove", onPointerMove, false );

	/*domElement.addEventListener( "mouseup", onPointerUp, false );
	domElement.addEventListener( "mouseout", onPointerUp, false );
	domElement.addEventListener( "touchend", onPointerUp, false );
	domElement.addEventListener( "touchcancel", onPointerUp, false );
	domElement.addEventListener( "touchleave", onPointerUp, false );*/
	
	function intersectObjects( pointer, objects, isOrtho ) {

		var rect = domElement.getBoundingClientRect();
		var x = pointer.offsetX;//;( pointer.offsetX - rect.left ) / rect.width;
		var y = pointer.offsetY;//;( pointer.offsetX - rect.top ) / rect.height;

    pointerVector.set( (x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1, 1  );
    
    if( !isOrtho)
		{
		  //pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1, 0.5 );
		  
		  pointerVector.unproject( camera );

		  ray.set( camPosition, pointerVector.sub( camPosition ).normalize() );

		  var intersections = ray.intersectObjects( objects, true );
		}else{
		
		 pointerVector.pickingRay( camera );
     ray.set( camPosition, pointerVector );
     var intersections = ray.intersectObjects( objects, true );
		}
		return intersections[0] ? intersections[0] : false;

	}
	
	function onPointerMove( event ) {

			event.preventDefault();
			event.stopPropagation();
			
			var pointer = event.changedTouches? event.changedTouches[0] : event;

      //console.log("this.children", scope.children );
			var intersect = intersectObjects( pointer, scope.viewCubeGizmo.children, true );
      //console.log("intersect", intersect.object);
      /*if(intersect && "highlight" in intersect.object.material){
        intersect.object.highlight("frontRightCorner");
      }*/
      if(intersect && intersect.object.name){
        scope.activeItem = intersect.object.name;
        console.log(scope.activeItem);
      }
      else{
        scope.activeItem = null;
      }
      if(intersect && intersect.object.name === "ViewCube")
      {
        var viewCube = intersect.object;
        viewCube.material.opacity = 0.8;
      }
      //intersect
			//point.copy( planeIntersect.point );
  }
  
  
  
}

CamViewControls.prototype.intersectObjects = function intersectObjects( pointer, objects ) {

	var rect = domElement.getBoundingClientRect();
	var x = ( pointer.clientX - rect.left ) / rect.width;
	var y = ( pointer.clientY - rect.top ) / rect.height;

	pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1, 0.5 );
	pointerVector.unproject( camera );

	ray.set( camPosition, pointerVector.sub( camPosition ).normalize() );

	var intersections = ray.intersectObjects( objects, true );
	return intersections[0] ? intersections[0] : false;

}

CamViewControls.prototype.update = function () {
		this.camera.updateMatrixWorld();
		this.camPosition.setFromMatrixPosition( this.camera.matrixWorld );
		//this.camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );
		//this.gizmo[_mode].highlight( scope.axis );
    this.viewCubeGizmo.highlight( this.activeItem );
}

