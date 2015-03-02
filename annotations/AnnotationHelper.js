/*
Base helper for all annotations
*/
AnnotationHelper = function(options)
{
  BaseHelper.call( this );
  
  var options = options || {}
  
  this.drawArrows      = options.drawArrows !== undefined ? options.drawArrows: true  ;
  this.drawLeftArrow   = options.drawLeftArrow !== undefined ? options.drawLeftArrow: true  ;
  this.drawRightArrow  = options.drawRightArrow !== undefined ? options.drawRightArrow : true;
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  
  //TODO: how to ? would require not using simple lines but strips
  //see ANGLE issue on windows platforms
  this.lineWidth  = options.lineWidth !== undefined ? options.lineWidth : 1;
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";//frontFacing or flat
  this.drawLabel  = options.drawLabel!== undefined ? options.drawLabel : true;
  this.lengthAsLabel  = options.lengthAsLabel!== undefined ? options.lengthAsLabel : true;
  this.textPrefix = options.textPrefix!== undefined ? options.textPrefix : "";//TODO: perhas a "textformat method would be better ??
  
  this.drawSideLines = options.drawSideLines!== undefined ? options.drawSideLines :true;
  this.sideLength    = options.sideLength!== undefined ? options.sideLength : 0; 
  this.sideLengthExtra = options.sideLengthExtra!== undefined ? options.sideLengthExtra : 2; 
  this.sideLineColor   = options.sideLineColor !== undefined ? options.sideLineColor:0x000000;
  this.sideLineSide    = options.sideLineSide !== undefined ? options.sideLineSide:"front";
  
  
  
  
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
  
  /*TODO: handle this:
    - align with slope or axis aligned
  */
}

AnnotationHelper.prototype = Object.create( BaseHelper.prototype );
AnnotationHelper.prototype.constructor = AnnotationHelper;  


/*
  get info about target object
*/
AnnotationHelper.prototype.getTargetBoundsData = function( target, intersection ){

  /* -1 /+1 directions on all 3 axis to determine for exampel WHERE an annotation
  should be placed (left/right, front/back, top/bottom)
  */
  var putSide= [0,0,0];
  //target.

  return {putSide:  putSide}; 
}  

