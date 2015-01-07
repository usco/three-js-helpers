
Box3C = function(options)
{
  THREE.Box3.call( this );
  
} 
Box3C.prototype = Object.create( THREE.Box3.prototype );
Box3C.prototype.constructor = AnnotationHelper;  

Box3C.prototype.setFromObject= function () {

		// Computes the world-axis-aligned bounding box of an object (including its children),
		// accounting for both the object's, and childrens', world transforms

		var v1 = new THREE.Vector3();
		//console.log("gna");

		return function ( object ) {
			var scope = this;

			object.updateMatrixWorld( true );

			this.makeEmpty();
			

      function goDown( node ){
        
        //exclude annotations
        if( node instanceof AnnotationHelper) {
         return;
        }
		    var geometry = node.geometry;

		    if ( geometry !== undefined ) {

			    if ( geometry instanceof THREE.Geometry ) {

				    var vertices = geometry.vertices;

				    for ( var i = 0, il = vertices.length; i < il; i ++ ) {

					    v1.copy( vertices[ i ] );

					    v1.applyMatrix4( node.matrixWorld );

					    scope.expandByPoint( v1 );

				    }

			    } else if ( geometry instanceof THREE.BufferGeometry && geometry.attributes[ 'position' ] !== undefined ) {

				    var positions = geometry.attributes[ 'position' ].array;

				    for ( var i = 0, il = positions.length; i < il; i += 3 ) {

					    v1.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

					    v1.applyMatrix4( node.matrixWorld );

					    scope.expandByPoint( v1 );

				    }

			    }

		    }
      
      
        for ( var i = 0, l = node.children.length; i < l; i ++ ) {
          goDown( node.children[ i ] );
			    //this.children[ i ].traverse( callback );
		    }
      
      }
      
      goDown( object );


			return this;

		};

	}()

