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



