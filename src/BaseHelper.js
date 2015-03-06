

/*
Abstract Base helper class
*/
class BaseHelper extends THREE.Object3D {
  constructor( options ) {
    const DEFAULTS = {
      name : "",
    }
    
    super();
  }
  
  setAsSelectionRoot( flag ){
    this.traverse(function( child ) {
		  child.selectable = !flag;
      child.selectTrickleUp = flag;
	  });
	  this.selectable = flag;
    this.selectTrickleUp = !flag;
  }
  
  hide( ){
    this.traverse(function( child ) {
		  child.visible = false;
	  });
  }
  
  show( ){
    this.traverse(function( child ) {
		  child.visible = true;
	  });
  }
  
  setOpacity( opacityPercent ){
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
  }
  
  highlight( flag ) {
	  this.traverse(function( child ) {
		  if ( child.material && child.material.highlight ){
				  child.material.highlight( flag );
			  }
	  });
	}
	
	highlight2( item ) {
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
  }
}

module.exports = BaseHelper;

