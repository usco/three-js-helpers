GizmoMaterial = function ( parameters ) {
		THREE.MeshBasicMaterial.call( this );
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues( parameters );
		
		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : 0xFFFF00;

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.set( this.highlightColor );//.setRGB( 1, 1, 0 );
				//this.opacity = 1;

			} else {

					this.color.copy( this.oldColor );
					//this.opacity = this.oldOpacity;

			}

		};
};

GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );

var GizmoLineMaterial = function ( parameters ) {
		THREE.LineBasicMaterial.call( this );
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues( parameters );
		
		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : "#ffd200";

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function( highlighted ) {

			if ( highlighted ) {

				this.color.set( this.highlightColor );//.setRGB( 1, 1, 0 );
				//this.opacity = 1;

			} else {

					this.color.copy( this.oldColor );
					//this.opacity = this.oldOpacity;
			}
		};
};

GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );


module.exports = {GizmoMaterial:GizmoMaterial, GizmoLineMaterial:GizmoLineMaterial};
