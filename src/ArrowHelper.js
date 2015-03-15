class ArrowHelper extends THREE.Object3D{

  constructor(direction, origin, length, color, headLength, headRadius, headColor) {
	  super();
	
	  this.direction = direction || new THREE.Vector3(1,0,0);
	  this.origin = origin || new THREE.Vector3(0,0,0);
	  this.length = length || 50;
	  this.color = color || "#FF0000";
    this.headLength = headLength || 6;
    this.headRadius = headRadius || headLength/7;
    this.headColor = headColor || this.color;
	
	  //dir, origin, length, hex
	  var lineGeometry = new THREE.Geometry();
	  lineGeometry.vertices.push(this.origin);
	  lineGeometry.vertices.push(this.direction.setLength(this.length));
	  this.line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: this.color } ) );
	  this.add(this.line);
	    
	  this.arrowHeadRootPosition = this.origin.clone().add(this.direction);
	  this.head = new THREE.Mesh(new THREE.CylinderGeometry(0, this.headRadius, this.headLength, 8, 1, false), new THREE.MeshBasicMaterial({color:this.headColor}));
	  this.head.position.copy( this.arrowHeadRootPosition );
    
    this.head.lookAt(this.arrowHeadRootPosition.clone().add(this.direction.clone().setLength(this.headLength)) );
    this.head.rotateX(Math.PI/2);
    
	  this.add( this.head );
	 }
}

export { ArrowHelper };
