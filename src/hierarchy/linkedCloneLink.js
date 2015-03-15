function drawLinkToLinkedClones(object)
{
    var original = object.parent.parent._original;
    //console.log("original", original,object);
    if(original)
    {
      var destPos = new THREE.Vector3();
      destPos = original.children[0].children[0].localToWorld( destPos );
      destPos = object.worldToLocal( destPos );
      drawLine(object, destPos);
    }

    var lClones = object.lClones;
    if(!(lClones)) {/*console.log("no linked clones");*/return};

    function drawLine(fromObject, to)
    {
      var lineGeometry = new THREE.Geometry();
      var vertArray = lineGeometry.vertices;
      vertArray.push( new THREE.Vector3(), to);

      lineGeometry.computeLineDistances();
      var lineMaterial = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 4, gapSize: 2 } );
      var line = new THREE.Line( lineGeometry, lineMaterial );
      line.name = "bob";


      var arrowPosition = to.clone().divideScalar( 2 ) //new THREE.Vector3()

      var arrowHead = new THREE.Mesh(new THREE.CylinderGeometry(0, 2, 10, 5, 5, false), new THREE.MeshBasicMaterial({color:0x000000}));
      //arrowHead.up = new THREE.Vector3(0,1,0);
      arrowHead.position = arrowPosition;//arrowPosition.divideScalar( 2 );//this.arrowHeadRootPosition;
      arrowHead.lookAt( to );
      arrowHead.rotateX(Math.PI/2);
      line.add( arrowHead );
      //object.material.wireframe = true;
      //child.material.wireframe = true;
      fromObject.add(line);
      fromObject.cloneLink = line;
    }
    return;
    for( var i =0; i<lClones.length;i++)
    {
      var child = lClones[i];


      //in order to center the arrow, reduce by bounding sphere radius of child & parent
      var offset = object.position.clone().sub(child.parent.position.clone())
      var childSub = child.position.clone().setLength(object.geometry.boundingSphere.radius);
      var parentSub =  child.position.clone().setLength(child.geometry.boundingSphere.radius);
      var arrowPosition = child.position.clone().sub(parentSub).add(childSub);

      var destPos = new THREE.Vector3();
      destPos = child.children[0].children[0].localToWorld( destPos );
      destPos = object.worldToLocal( destPos )

      drawLine( object, destPos);
     }
  }
  
   //OLD code used to refresh linked clones helper on transform controls changed event
 if( this.selectedObjects.length>0 && this.selectedObjects[0].lClones || this.selectedObjects[0].parent.parent._original)
  {
    if( this.selectedObjects[0].cloneLink) this.selectedObjects[0].remove( this.selectedObjects[0].cloneLink );
    drawLinkToLinkedClones(this.selectedObjects[0]);
  }
