/*
Base helper for all annotations
*/
AnnotationHelper = function(options)
{
  BaseHelper.call( this );
  
  var options = options || {}
  
  /*notes is an extra data field FOR ALL annotations
  and should contain any user defined remarks in addition
  to the measured data itself etc*/
  this.notes = "";

  /*this would be practical for "human referencing": ie
  for example "front mount hole" for a given measurement etc
  should name uniqueness be enforced ? yes, makes sense!
  */
  this.name = "";
  
  //FIXME: not too sure, this is a pointer to the data structure 
  //this.note =
  
  //can this object be translated/rotated/scaled on its own ? NOPE
  this.transformable = false;
}

AnnotationHelper.prototype = Object.create( BaseHelper.prototype );
AnnotationHelper.prototype.constructor = AnnotationHelper;  


GizmoMaterial = function ( parameters ) {
		THREE.MeshBasicMaterial.call( this );
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		this.opacity = 0.8;
		this.setValues( parameters );
		
		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : 0xFFFF00;

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.set( this.highlightColor );//.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

					this.color.copy( this.oldColor );
					this.opacity = this.oldOpacity;

			}

		};
};

GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );

GizmoLineMaterial = function ( parameters ) {
		THREE.LineBasicMaterial.call( this );
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		this.opacity = 0.8;
		this.setValues( parameters );
		
		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : "#ffd200";

		this.oldColor = this.color.clone();
		this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.set( this.highlightColor );//.setRGB( 1, 1, 0 );
				this.opacity = 1;

			} else {

					this.color.copy( this.oldColor );
					this.opacity = this.oldOpacity;

			}

		};
};

GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );


