
/*
Abstract Base helper class
*/
BaseHelper = function()
{
  THREE.Object3D.call( this );
}

BaseHelper.prototype = Object.create( THREE.Object3D.prototype );
BaseHelper.prototype.constructor = BaseHelper;

BaseHelper.prototype.setAsSelectionRoot = function ( flag ) {
	this.traverse(function( child ) {
		child.selectable = !flag;
    child.selectTrickleUp = flag;
	});
	this.selectable = flag;
  this.selectTrickleUp = !flag;
};

BaseHelper.prototype.hide = function () {
	this.traverse(function( child ) {
		child.visible = false;
	});
};

BaseHelper.prototype.show = function () {
	this.traverse(function( child ) {
		child.visible = true;
	});
};

BaseHelper.prototype.setOpacity = function (opacityPercent) {
	this.traverse(function( child ) {
	  if(child.material)
	  {
	    child.material.opacity = child.material.opacity*opacityPercent;
	    if(child.material.opacity < 1)
	    {
	      child.material.transparent = true;
	    }
	    //console.log("applying opacity to ",child);
	  }
	  else{
	    //console.log("not applying opacity to",child);
	  }

	});
};


BaseHelper.prototype.highlight = function ( flag ) {
	this.traverse(function( child ) {
		if ( child.material && child.material.highlight ){
				child.material.highlight( flag );
			}
	});
};


BaseHelper.prototype.highlight2 = function ( item ) {
	this.traverse(function( child ) {
		if ( child.material && child.material.highlight ){
			if ( child === item ) {
				child.material.highlight( true );
				return
			} else {
				child.material.highlight( false );
			}
		}
	});
};

