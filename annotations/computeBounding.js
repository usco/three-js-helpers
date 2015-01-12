

computeObject3DBoundingBox = function(object)
{
  if( object.geometry === undefined)
  {
      var bbox = new THREE.Box3();
  }
  else
  {
    
    if (! object.geometry.boundingBox )
    {
      object.geometry.computeBoundingBox();
    } 
    var bbox = object.geometry.boundingBox.clone();
  }
  
  object.traverse(function (child) {

    if (child instanceof THREE.Mesh)
    {
        if( child.geometry !==undefined)
        {
             
          if (! child.geometry.boundingBox ){
            child.geometry.computeBoundingBox();
          }
          var childBox = child.geometry.boundingBox.clone();
          childBox.translate( child.localToWorld( new THREE.Vector3() ) );
          bbox.union( childBox );
        }
    }
  });
  return bbox
}

computeObject3DBoundingSphere = function(object)
{
  return computeObject3DBoundingBox().getBoundingSphere();
}
