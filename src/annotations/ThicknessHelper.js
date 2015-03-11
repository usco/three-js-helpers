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
    this._computeBasics();
    
    this.setAsSelectionRoot( true );
  }
  
  _computeBasics(){
    var entryPoint = this.entryPoint;
    var exitPoint = this.exitPoint;
    var object    = this.object;
    
    if( ! entryPoint || ! exitPoint || ! object ) return;
    
    var endToStart = exitPoint.clone().sub( entryPoint )
    this.thickness = endToStart.length();
    
    try{
      var midPoint = endToStart.divideScalar( 2 ).add( entryPoint );
      var putSide = this.getTargetBoundsData(object, midPoint);
    }catch(error){
      console.error(error);
    }
    
    this.thicknessHelperArrows.setFromParams( {
      start:entryPoint,
      end:exitPoint,
      facingSide:putSide,
    });
    this.thicknessHelperArrows.show();
  }
   
   /*configure all the basic visuals of this helper*/
  _setupVisuals(){
    this.thicknessHelperArrows = new SizeHelper({
      textColor:this.textColor, 
      textBgColor:this.textBgColor, 
      fontSize:this.fontSize,
      fontFace:this.fontFace,
      labelType:"flat",
      arrowsPlacement:"outside",
      arrowColor: this.arrowColor,
      sideLength:this.sideLength
    });
    this.thicknessHelperArrows.hide();
    this.add( this.thicknessHelperArrows );
  
    //debug helpers
    this.faceNormalHelper  = new THREE.ArrowHelper( new THREE.Vector3(), new THREE.Vector3(), 15, 0XFF0000 );
    this.faceNormalHelper2 = new THREE.ArrowHelper( new THREE.Vector3(), new THREE.Vector3(), 15, 0X00FF00 );
    this.entryPointHelper = new CrossHelper({color:0xFF0000});
    this.exitPointHelper = new CrossHelper({color:0x00FF00});
    
    this.debugHelpers = new BaseHelper();
    this.debugHelpers.add( this.faceNormalHelper );
    this.debugHelpers.add( this.faceNormalHelper2 );
    this.debugHelpers.add( this.entryPointHelper );
    this.debugHelpers.add( this.exitPointHelper );
    
    //this.add( this.debugHelpers );
    
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
    //FIXME: todo or not ??
    this.position.setFromMatrixPosition( object.matrixWorld );
    object.worldToLocal( entryPoint );
    object.worldToLocal( exitPoint );
    
    
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
    
    }catch(error){
      console.error(error);
    }
    this.thicknessHelperArrows.setFromParams( {
      start:entryPoint,
      end:exitPoint,
      facingSide:putSide,
    });
    this.thicknessHelperArrows.show();
  }

  unset(){
    //this.thickness = undefined;
    this.position.set(0, 0, 0);
    let options = Object.assign({}, this.DEFAULTS, options); 
    Object.assign(this, options);//unsure
    this.thicknessHelperArrows.hide();
  }
}

module.exports = ThicknessHelper;
