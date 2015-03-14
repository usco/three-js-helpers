var OutlineObject = function( options ) {
  var options = options || {};
  this.outlineColor = options.color || "#FF0000";
}

OutlineObject.prototype = {
  constructor: OutlineObject
};

OutlineObject.prototype.addTo = function( object , options){
    if( !object ) return;
    
    //add to new selection
    var outlineMaterial = new THREE.MeshBasicMaterial({
      color: this.outlineColor,
      side: THREE.BackSide,
    });
    
    
    
    var outline = new THREE.Mesh(object.geometry, outlineMaterial);
    
    outline.selectable      = false;
    outline.selectTrickleUp = true;
    outline.transformable   = false;
    outline.name = "selectionOutline";
    
    outline.material.depthTest  = true;
    outline.material.depthWrite = true;
    outline.scale.multiplyScalar(1.02);
    
    object._outline = outline;
    object.add(outline);
 }
 
 OutlineObject.prototype.removeFrom = function( object , options){
  if( !object ) return;
  
  if(!object._outline) return;
  //remove from old selection
  object.remove(object._outline);
  delete object._outline;
 }
