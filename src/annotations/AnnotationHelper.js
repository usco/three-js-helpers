var BaseHelper = require("../BaseHelper");

/*
Base helper for all annotations
*/
class AnnotationHelper extends BaseHelper {
  constructor( options ) {
    const DEFAULTS = {
      name : "",
      drawArrows: true,
      drawLeftArrow: true,
      drawRightArrow: true,
      arrowColor: "000",
      arrowsPlacement:'dynamic',//can be either, dynamic, inside, outside
      arrowHeadSize:2.0,
      arrowHeadWidth:0.8,
      
      lineWidth: 1,
      drawSideLines: true,
      sideLength:0,
      sideLengthExtra: 2,//how much sidelines should stick out
      sideLineColor: "000",
      sideLineSide: "front",
      
      drawLabel: true,
      labelPos:"center",
      labelType: "flat",//frontFacing or flat
      fontSize: 10,
      fontFace: "Jura",
      textColor: "#000",
      textBgColor: null,
      lengthAsLabel: true, //TODO: "length is too specific change that"
      textPrefix : "",//TODO: perhas a "textformat method would be better ??
    }
  
  //TODO: how to deal with lineWidth would require not using simple lines but strips
  //see ANGLE issue on windows platforms
    
    let options = Object.assign({}, DEFAULTS, options); 
    
    super( options );    
    
    Object.assign(this, options);
    

    /*this would be practical for "human referencing": ie
    for example "front mount hole" for a given measurement etc
    should name uniqueness be enforced ? yes, makes sense!
    */
    //this.name = "";
    
    //can this object be translated/rotated/scaled on its own ? NOPE
    this.transformable = false;
  }
  
  /*
    get info about target object
  */
  getTargetBoundsData( targetObject, point ){
    /* -1 /+1 directions on all 3 axis to determine for exampel WHERE an annotation
    should be placed (left/right, front/back, top/bottom)
    */
    var putSide= [0,0,0];
    if(!targetObject ) return putSide;
    var bbox     = targetObject.boundingBox;
    
    let objectCenter =   new THREE.Vector3().addVectors( targetObject.boundingBox.min,
      targetObject.boundingBox.max).divideScalar(2);
      
    //let realCenter = point.clone().sub( objectCenter );
    //console.log("objectCenter",objectCenter,"point", point,foo.normalize());
    
    let axes = ["x","y","z"];
    axes.forEach( (axis, index) => {
      let axisOffset  = point[axis] - objectCenter[axis];
      axisOffset = Math.round(axisOffset * 100) / 100;
      if( axisOffset>0 ){
        putSide[index] = 1;
      }
      else if( axisOffset<0 )
      {
        putSide[index] = -1;
      }
    });
    
    console.log("putSide",putSide);
    putSide = new THREE.Vector3().fromArray( putSide );
    return putSide; 
  }  

  
}


module.exports = AnnotationHelper;


