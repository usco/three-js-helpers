var BaseHelper = require("../BaseHelper");
//import {BaseHelper} from "../BaseHelper";
var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");
var CrossHelper = require("../CrossHelper");

class ThicknessHelper extends AnnotationHelper {
  constructor( options ) {
    const DEFAULTS = {
        normalType:  "face",//can be, face, x,y,z
        sideLength: 10,
        
        object:    undefined,
        entryPoint:undefined,
        exitPoint :undefined,
        thickness: undefined,
    };
    
    this.DEFAULTS = DEFAULTS;
    let options = Object.assign({}, DEFAULTS, options); 
    super(options);
    Object.assign(this, options);//unsure
    
    //initialise visuals
    this._setupVisuals();
    
    this.setAsSelectionRoot( true );
  }
  
  setThickness( thickness ){
    this.thickness  = thickness;
  }
  
  setEntryPoint( entryPoint, object ){
    this.entryPoint  = entryPoint;
    this.object = object;
  }
  
  setExitPoint( exitPoint ){
    this.exitPoint  = exitPoint;
  }

  set( entryInteresect )//, selectedObject)
  {
    var normalType = this.normalType;
    var normal  = entryInteresect.face.normal.clone();
    switch(normalType)
    {
      case "face":
      break;
      case "x":
        normal = new THREE.Vector3(1,0,0);
      break;
      case "y":
        normal = new THREE.Vector3(0,1,0);
      break;
      case "z":
        normal = new THREE.Vector3(0,0,1);
      break;
    }
    
    var object = entryInteresect.object;
    if( !object ) return;
    
    var entryPoint = entryInteresect.point.clone();
    var flippedNormal = normal.clone().negate();
    var offsetPoint = entryPoint.clone().add( flippedNormal.clone().multiplyScalar(1000));
    
    //get escape entryPoint
    var raycaster = new THREE.Raycaster(offsetPoint, normal.clone().normalize());
    var intersects = raycaster.intersectObjects([object], true);
    
    var exitPoint = null;
    var minDist = Infinity;
    for(var i=0;i<intersects.length;i++)
    {
      var curPt = intersects[i].point;
      var curLn = curPt.clone().sub( entryPoint ).length();
      
      if( curLn < minDist )
      {
        exitPoint = curPt;
        minDist = curLn;
      }
    }
    //compute actual thickness
    let endToStart = exitPoint.clone().sub( entryPoint )
    this.thickness = endToStart.length();
    
    //set various internal attributes
    this.setEntryPoint( entryPoint, object);
    this.exitPoint = exitPoint;
    try{
      var midPoint = endToStart.divideScalar( 2 ).add( entryPoint );
      console.log("midPoint",entryPoint, midPoint, exitPoint);
      var putSide = this.getTargetBoundsData(object, midPoint);
      //this.thicknessHelperArrows.setFacingSide( new THREE.Vector3().fromArray( putSide ) );
    
    }catch(error){
      console.error(error);
    }
    //this.thicknessHelperArrows.setStart( entryPoint );
    //this.thicknessHelperArrows.setEnd( exitPoint );
    //this.thicknessHelperArrows.setFacingSide( putSide );
    this.thicknessHelperArrows.setFromParams( {
      start:entryPoint,
      end:exitPoint,
      facingSide:putSide,
    });
    this.thicknessHelperArrows.show();
  }

  unset(){
    //this.thickness = undefined;
    let options = Object.assign({}, this.DEFAULTS, options); 
    Object.assign(this, options);//unsure
    this.thicknessHelperArrows.hide();
  }

  //call this when everything has been set ?
  done(){
    //this.thicknessHelperArrows.setStart( this.entryPoint );
    //this.thicknessHelperArrows.setEnd( this.exitPoint );
    this.thicknessHelperArrows.show();
  }
  
  /* call this to set all params all at once*/
  setFromParams( params ){
  }

  //temporary
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
  
  _setupVisuals(){
    this.thicknessHelperArrows = new SizeHelper({
      textColor:this.textColor, 
      textBgColor:this.textBgColor, 
      fontSize:this.fontSize,
      fontFace:this.fontFace,
      arrowsPlacement:"outside",
      labelType:"flat",
      sideLength:this.sideLength
    });
    this.thicknessHelperArrows.hide();
    this.add( this.thicknessHelperArrows );
  
    //debug helpers
    this.faceNormalHelper  = new THREE.ArrowHelper( new THREE.Vector3(), new THREE.Vector3(), 15, 0XFF0000 );
    this.faceNormalHelper2 = new THREE.ArrowHelper( new THREE.Vector3(), new THREE.Vector3(), 15, 0X00FF00 );
    this.entryPointHelper = new CrossHelper({color:0xFF0000});
    this.exitPointHelper = new CrossHelper({color:0xFF0000});
    
    
    this.debugHelpers = new BaseHelper();
    
    this.debugHelpers.add( this.faceNormalHelper );
    this.debugHelpers.add( this.faceNormalHelper2 );
    this.debugHelpers.add( this.entryPointHelper );
    this.debugHelpers.add( this.exitPointHelper );
    
    this.add( this.debugHelpers );
    
    if( !this.debug ){
      this.debugHelpers.hide();
    }
  }
  
  _updateVisuals(){
    this.faceNormalHelper.setStart( this.entryPoint );
    this.faceNormalHelper.setDirection( this.exitPoint.clone().sub( this.entryPoint ) );
    
    this.faceNormalHelper2.setStart( this.exitPoint );
    this.faceNormalHelper2.setDirection( this.entryPoint.clone().sub( this.exitPoint ) );
    
    this.entryPointHelper.position.copy( this.entryPoint );
    this.exitPointHelper.position.copy( this.exitPoint );
  }
  
  toJson(){
  
  }
}

module.exports = ThicknessHelper;
