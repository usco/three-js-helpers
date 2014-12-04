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

		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.FrontSide;
		//this.transparent = true;

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


CubeEdge = function( size, width, color, position, selectionCallback ){
  var size = size || 10;
  var width = width || 4;
  var position = position || new THREE.Vector3();
  var color = color || 0xFF0000;
  this.selectionCallback = selectionCallback;

  var midSize = size - width*2;
  var planeGeometry = new THREE.PlaneGeometry( midSize, width, 2, 2 );
  planeGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI/2 ) ); 
  planeGeometry.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI/2 ) ); 
  planeGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( -width /2, 0 ,size /2 ) );
  
  var planeGeometry2 = planeGeometry.clone();
  planeGeometry2.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI/2 ) ); 
  
  //final geometry
  var geometry = new THREE.Geometry();
  geometry.merge(planeGeometry);
  geometry.merge(planeGeometry2);
  //geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, width/2 , 0 ) );
  geometry = new THREE.BoxGeometry( width, width, midSize );
  geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -width /2, -width /2 ,size /2 ) );
  
  var material = new GizmoMaterial( { color:color, 
	   side : THREE.DoubleSide,opacity:1,transparent:true
	  } );
  //depthTest:false, depthWrite:false 
  THREE.Mesh.call(this, geometry, material);
  this.position.copy( position );
}

CubeEdge.prototype = Object.create( THREE.Mesh.prototype );
CubeEdge.prototype.constructor = CubeEdge;  

CubeEdge.prototype.onSelect = function(){
  if(this.selectionCallback){
    this.selectionCallback( this.name );
  }
}


CubePlane = function( size, color, position, selectionCallback ){
  var size = size || 10;
  var position = position || new THREE.Vector3();
  var color = color || 0xFF0000;
  this.selectionCallback = selectionCallback;

  var geometry = new THREE.PlaneBufferGeometry( size, size, 2, 2 );
  var material = new GizmoMaterial( { color:color, side : THREE.DoubleSide,
  opacity:1,transparent:true });
  //, depthTest:false , side:THREE.FrontSide
  
  THREE.Mesh.call(this, geometry, material);
  this.position.copy( position );
}

CubePlane.prototype = Object.create( THREE.Mesh.prototype );
CubePlane.prototype.constructor = CubePlane;  

CubePlane.prototype.onSelect = function(){
  if(this.selectionCallback){
    this.selectionCallback( this.name );
  }
}


CubeCorner = function( size, color, position, selectionCallback ){
  var size = size || 10;
  var position = position || new THREE.Vector3();
  var color = color || 0xFF0000;
  this.selectionCallback = selectionCallback;

  var geometry = new THREE.BoxGeometry( size, size, size);
  var material = new GizmoMaterial( { color:color, side : THREE.DoubleSide,
  opacity:1,transparent:true });
  //, depthTest:false , side:THREE.FrontSide
  
  THREE.Mesh.call(this, geometry, material);
  this.position.copy( position );
}

CubeCorner.prototype = Object.create( THREE.Mesh.prototype );
CubeCorner.prototype.constructor = CubeCorner;  

CubeCorner.prototype.onSelect = function(){
  if(this.selectionCallback){
    this.selectionCallback( this.name );
  }
}



ViewCubeGizmo = function( size, cornerWidth, position, edgesColor, planesColor, cornersColor, controlledCameras ){
  THREE.Object3D.call( this );
  
  var size        = size || 10;
  var cornerWidth = cornerWidth || 4;
  var position    = position || new THREE.Vector3();
  var planesColor = planesColor || 0x00FF00;
  var edgesColor  = edgesColor  || 0x0000FF;
  var cornersColor= cornersColor|| 0xFF0000;
  var controlledCameras = controlledCameras;

  this.edges   = new THREE.Object3D();
  this.planes  = new THREE.Object3D();
  this.corners = new THREE.Object3D();
  
  var orientationMap = {
    "F":    "Front",
    "B":    "Back",
    "L":    "Left",
    "R":    "Right",
    "A":    "Top",
    "U":    "Bottom",
    
    "FL":   "FrontLeft",
		"FR":   "FrontRight",
		"FT":   "FrontTop",
		"FB":   "FrontBottom", 
		
    "BL":   "BackLeft",
		"BR":   "BackRight",
		"BT":   "BackTop",
		"BB":   "BackBottom", 
		
		"LT":   "LeftTop",
		"LB":   "LeftBottom",
		"RT":   "RightTop",
		"RB":   "RightBottom",
		
		"FTL":   "FrontTopLeft",
		"FTR":   "FrontTopRight",
		"FBL":   "FrontBottomLeft",
		"FBR":   "FrontBottomRight",
		
	  "BTL":   "BackTopLeft",
		"BTR":   "BackTopRight",
		"BBL":   "BackBottomLeft",
		"BBR":   "BackBottomRight",
  };
  
  var orientationCallback = function( orientationShortName ){
    for(var i=0;i<controlledCameras.length;i++)
    {
      var controlledCamera = controlledCameras[i];
      //console.log("yeahn orientation selected : "+orientationShortName+" in ",controlledCamera);
      controlledCamera.orientation = orientationMap[orientationShortName];
    }
  }
  
  //planes
  var plSize = size - cornerWidth*2;
  var planes = {
		"F":   new CubePlane( plSize, planesColor, null, orientationCallback ),
		"B":   new CubePlane( plSize, planesColor, null, orientationCallback ),
		"L":   new CubePlane( plSize, planesColor, null, orientationCallback ),
		"R":   new CubePlane( plSize, planesColor, null, orientationCallback ),
		"A":   new CubePlane( plSize, planesColor, null, orientationCallback ),
		"U":   new CubePlane( plSize, planesColor, null, orientationCallback ),
	};
	
	planes["F"].rotation.set( 0, Math.PI/2, 0 );
	planes["F"].position.set( size/2, 0, size/2 );
	planes["B"].rotation.set( 0, -Math.PI/2, 0 );
	planes["B"].position.set( -size/2, 0,size/2 );
	
	planes["L"].rotation.set( -Math.PI/2, 0, -Math.PI );
	planes["L"].position.set( 0, size/2, size/2 );
	planes["R"].rotation.set( -Math.PI/2, 0, -Math.PI );
	planes["R"].position.set( 0,-size/2, size/2 );
	
	planes["A"].position.set( 0, 0, size );
	planes["U"].position.set( 0, 0, 0 );

	for (var i in planes) {
		planes[i].name = i;
		this.planes.add(planes[i]);
		this.planes[i] = planes[i];
		planes[i].visible = false;
	}
  
  //edges
  var edges = {
		"FL":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"FR":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"FT":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"FB":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		
		"BL":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"BR":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"BT":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"BB":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		
		"LT":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"LB":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"RT":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
		"RB":   new CubeEdge( size, cornerWidth, edgesColor, null, orientationCallback ), 
	};
	
	size += 0.1;
	//front
	edges["FL"].rotation.set( 0, 0, -Math.PI/2 );
	edges["FL"].position.set( size/2,-size/2, 0 );
	edges["FR"].position.set( size/2, size/2, 0 );
	
	edges["FT"].rotation.set( Math.PI/2, 0, 0 );
	edges["FT"].position.set( size/2, size/2, size );
	edges["FB"].rotation.set( -Math.PI/2, 0, 0 );
	edges["FB"].position.set( size/2, -size/2, 0 );
	
	//back	
	edges["BL"].rotation.set( 0, 0, Math.PI/2 );
	edges["BL"].position.set( -size/2,size/2, 0 );
	edges["BR"].rotation.set( 0, 0, -Math.PI );
	edges["BR"].position.set( -size/2, -size/2, 0 );

	edges["BT"].rotation.set( Math.PI/2, Math.PI , 0);
	edges["BT"].position.set( -size/2, -size/2, size );
	edges["BB"].rotation.set( -Math.PI/2, Math.PI, 0 );
	edges["BB"].position.set( -size/2, size/2, 0 );
	
	//sides (left/right)
	edges["LT"].rotation.set( Math.PI/2, -Math.PI/2 , 0);
	edges["LT"].position.set( size/2, -size/2, size );
	edges["LB"].rotation.set( Math.PI, -Math.PI/2 , 0);
	edges["LB"].position.set( size/2, -size/2, 0 );
	
	edges["RT"].rotation.set( Math.PI/2, Math.PI/2 , 0);
	edges["RT"].position.set( -size/2, size/2, size );
	
	edges["RB"].rotation.set( 0, Math.PI/2 , 0);
	edges["RB"].position.set( -size/2, size/2, 0 );
  
  
	for (var i in edges) {
		edges[i].name = i;
		this.edges.add(edges[i]);
		this.edges[i] = edges[i];
    edges[i].visible = false;
	}
	
	//corners
	size -= 0.1;
	var cSize = cornerWidth;
  var corners = {
		"FTL":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"FTR":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"FBL":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"FBR":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		
	  "BTL":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"BTR":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"BBL":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
		"BBR":   new CubeCorner( cSize, cornersColor, null, orientationCallback ),
	};
	
	corners["FTL"].position.set( (size-cSize)/2, -(size-cSize)/2, size-cSize/2 );
	corners["FTR"].position.set( (size-cSize)/2, (size-cSize)/2, size-cSize/2 );
	corners["FBL"].position.set( (size-cSize)/2, -(size-cSize)/2, cSize/2 );
	corners["FBR"].position.set( (size-cSize)/2, (size-cSize)/2, cSize/2 );
	
	corners["BTL"].position.set( -(size-cSize)/2, -(size-cSize)/2, size-cSize/2 );
	corners["BTR"].position.set( -(size-cSize)/2, (size-cSize)/2, size-cSize/2 );
	corners["BBL"].position.set( -(size-cSize)/2, -(size-cSize)/2, cSize/2 );
	corners["BBR"].position.set( -(size-cSize)/2, (size-cSize)/2, cSize/2 );
	
	for (var i in corners) {
		corners[i].name = i;
		this.corners.add(corners[i]);
		this.corners[i] = corners[i];
		corners[i].visible = false;
	}
  
  this.add( this.edges );
  this.add( this.planes );
  this.add( this.corners );
  
  this.position.copy( position );
  
  //event handling
  //orientation
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
	});
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

 
CamViewControls = function (size, cornerWidth, controlledCameras) { 
	 THREE.Object3D.call( this );
	
	 var size = 15;
	 var cornerWidth = 3;
	 var controlledCameras = controlledCameras;
	 
	 /*var edgesColor = 0x889999;
	 var planesColor = 0x778888;
	 var cornersColor = 0x778888;*/
	 var edgesColor = null;
	 var planesColor = null;
	 var cornersColor = null;
	 
	 
	 this.viewCubeGizmo = new ViewCubeGizmo(size, cornerWidth, new THREE.Vector3(size/2,size/2,0)
	  , edgesColor, planesColor, cornersColor, controlledCameras);
	  
	 this.add( this.viewCubeGizmo );
	 this.add( new THREE.LabeledAxes(size-4, null, null, null, null,true,true) );
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
  
  domElement.addEventListener( "mousedown", onPointerDown, true );
	domElement.addEventListener( "touchstart", onPointerDown, true );

  var useCapture = false;
  
	domElement.addEventListener( "mousemove", onPointerMove, useCapture );
	domElement.addEventListener( "touchmove", onPointerMove, useCapture );

	domElement.addEventListener( "mouseup", onPointerUp, useCapture );
	domElement.addEventListener( "mouseout", onPointerUp, useCapture );
	domElement.addEventListener( "touchend", onPointerUp, useCapture );
	domElement.addEventListener( "touchcancel", onPointerUp, useCapture );
	domElement.addEventListener( "touchleave", onPointerUp, useCapture );
	
	function intersectObjects( pointer, objects, isOrtho ) {

		var rect = domElement.getBoundingClientRect();
		var x = pointer.offsetX;//;( pointer.offsetX - rect.left ) / rect.width;
		var y = pointer.offsetY;//;( pointer.offsetX - rect.top ) / rect.height;

    //pointerVector.set( (x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1, 1  );
    
    var x = ( pointer.clientX - rect.left ) / rect.width;
	  var y = ( pointer.clientY - rect.top ) / rect.height;

	  pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1, 0.5 );
    
    
    if( !isOrtho)
		{
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

			var intersect = intersectObjects( pointer, scope.viewCubeGizmo.children, true );
			
      if(intersect && intersect.object.name){
        scope.activeItem = intersect.object.name;
        scope.viewCubeGizmo.show();
      }
      else{
        scope.activeItem = null;
        scope.viewCubeGizmo.hide();
      }
      //intersect
			//point.copy( planeIntersect.point );
  }
  function onPointerDown( event ) {
      //console.log("pointer up in camView controls");

			var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
			var intersect = intersectObjects( pointer, scope.viewCubeGizmo.children, true );
			if(intersect && intersect.object.onSelect)
			{
		  	event.preventDefault();
			  event.stopPropagation();
			  event.stopImmediatePropagation();
			  
			  intersect.object.onSelect();
			}
  }
  
  function onPointerUp( event ) {
    scope.activeItem = null;
  
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

