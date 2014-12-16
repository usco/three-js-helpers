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
}

AnnotationHelper.prototype = Object.create( BaseHelper.prototype );
AnnotationHelper.prototype.constructor = AnnotationHelper;  
