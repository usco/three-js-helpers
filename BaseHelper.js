
/*
Abstract Base helper class
*/
BaseHelper = function()
{
  THREE.Object3D.call( this );
}

BaseHelper.prototype = Object.create( THREE.Object3D.prototype );
BaseHelper.prototype.constructor = BaseHelper;

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


