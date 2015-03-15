function drawParentChildLinks(object)
{
  //just a test to display parent children relationships
    for( var i =0; i<object.children.length;i++)
    {
      var child = object.children[i];
      if(child.name !== "" && child.name != "bob")
      {
          console.log("child",child);
          var lineGeometry = new THREE.Geometry();
          var vertArray = lineGeometry.vertices;
          vertArray.push( new THREE.Vector3(), child.position.clone() );

          //in order to center the arrow, reduce by bounding sphere radius of child & parent
          console.log("BB",child.geometry.boundingSphere);
          var childSub = child.position.clone().setLength(object.geometry.boundingSphere.radius);
          var parentSub =  child.position.clone().setLength(child.geometry.boundingSphere.radius);
          console.log("parentSub",parentSub.length(), "childSub",childSub.length(),"bla",object.geometry.boundingSphere.radius, child.geometry.boundingSphere.radius);
          var arrowPosition = child.position.clone().sub(parentSub).add(childSub);

          lineGeometry.computeLineDistances();
          var lineMaterial = new THREE.LineDashedMaterial( { color: 0x00cc00, dashSize: 4, gapSize: 2 } );
          var line = new THREE.Line( lineGeometry, lineMaterial );
          line.name = "bob";

          var arrowHead = new THREE.Mesh(new THREE.CylinderGeometry(0, 4, 15, 5, 5, false), new THREE.MeshBasicMaterial({color:0x00cc00}));
          //arrowHead.up = new THREE.Vector3(0,1,0);

          arrowHead.position = arrowPosition.divideScalar( 2 );//this.arrowHeadRootPosition;
          arrowHead.lookAt( child.position );
          arrowHead.rotateX(Math.PI/2);
          line.add( arrowHead );
          
          //object.material.wireframe = true;
          //child.material.wireframe = true;
          object.add(line);
      }
     }
  }
