this.selectionColor = 0xf7c634;//0xff5400;//0xfffccc;
	  this.outlineColor = 0xffc200;
    function validForOutline(selection)
    {
      return (!(selection.hoverOutline != null) && !(selection.outline != null) && !(selection.name === "hoverOutline") && !(selection.name === "boundingCage") && !(selection.name === "selectOutline"))
    }

    var curHovered = this.highlightedObject;

    if (curHovered != null )
    {
      var hoverEffect = new THREE.Object3D();
      var outline, outlineMaterial;
      curHovered.currentHoverHex = curHovered.material.color.getHex();
      curHovered.material.color.setHex(this.selectionColor);
      //curHovered.material.vertexColors = THREE.FaceColors;
      
      //curHovered.currentHoverHexSpec = curHovered.material.specular.getHex();
      //curHovered.material.specular.setHex(this.selectionColor);
      
      //curHovered.material.shininess=8; //.setHex(this.selectionColor);
      outlineMaterial = new THREE.MeshBasicMaterial({
          color: 0xffc200,
          side: THREE.BackSide
        });

      outlineMaterialTest = new THREE.LineBasicMaterial({
          color: 0xffc200,
          linewidth: 10
          //side: THREE.BackSide
        });
      outlineMaterialTest = new THREE.MeshBasicMaterial({ 
          color: 0xffc200,
          wireframe: true, wireframeLinewidth: 4 ,side: THREE.BackSide} );

      outline = new THREE.Object3D();//new THREE.Mesh(curHovered.geometry, outlineMaterial);
      outline.scale.multiplyScalar(1.03);
      outline.name = "hoverOutline";
      curHovered.hoverOutline = outline;
      curHovered.add(outline);
    }
    if(oldHovered != null)
    {
      if (oldHovered.hoverOutline != null)
      {
        oldHovered.material.color.setHex(oldHovered.currentHoverHex);
        //oldHovered.material.specular.setHex(oldHovered.currentHoverHexSpec);
        //oldHovered.material.shininess = 10;

        oldHovered.remove(oldHovered.hoverOutline);
        oldHovered.hoverOutline = null;
      }
    }
