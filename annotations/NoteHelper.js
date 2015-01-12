/*
  Made of one main arrow, and two lines perpendicular to the main arrow, at both its ends
*/
NoteHelper = function(options)
{
  AnnotationHelper.call( this );

  var options = options || {};
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
  
  this.crossColor = options.crossColor!== undefined ? options.crossColor : "#F00";
  this.text       = options.text      !== undefined ? options.text : "";
  this.title      = options.title     !== undefined ? options.title : "";

  //initialise internal sub objects
  this.pointCross = new CrossHelper({size:2.5,color:this.crossColor});
  this.pointCross.hide();
  this.add( this.pointCross );
  
  
  this.point      = options.point!== undefined ? options.point : undefined;
  this.object     = options.object!== undefined ? options.object : undefined;
  
  if( options.point ) this.setPoint( this.point, this.object );
  
  this.setAsSelectionRoot( true );
  //FIXME: do this in a more coherent way
  this._setName();
}

NoteHelper.prototype = Object.create( AnnotationHelper.prototype );
NoteHelper.prototype.constructor = NoteHelper;


NoteHelper.prototype.unset = function( ){
  this.pointCross.hide();
}

NoteHelper.prototype.setPoint = function( point, object ){
  if(point) this.point = point;
  if(object) this.object = object;

  //point location cross
  this.pointCross.position.copy( this.point );
  this.pointCross.show();
}

NoteHelper.prototype._setName = function( ){
  this.name = "Note: " + this.title;
}

