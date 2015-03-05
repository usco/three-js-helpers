var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");
var CrossHelper = require("../CrossHelper");

class ThicknessHelper extends AnnotationHelper {
  constructor( options ) {
    const DEFAULTS = {
        normalType:  "face",//can be, face, x,y,z
        sideLength: 10,
        debug:false,
        object:undefined,
        thickness:undefined,
    };
    
    this.DEFAULTS = DEFAULTS;
    let options = Object.assign({}, DEFAULTS, options); 
    super(options);
    Object.assign(this, options);//unsure
    
    this.object     = undefined;
    this.point      = undefined;
    this.normal     = undefined;
    
    //initialise internal sub objects
    this.thicknessHelperArrows = new SizeHelper({
      textColor:this.textColor, 
      textBgColor:this.textBgColor, 
      arrowsPlacement:"outside",
      labelType:"flat",
      sideLength:this.sideLength
    });
    this.thicknessHelperArrows.hide();
    this.add( this.thicknessHelperArrows );
    
    if( options.thickness )this.setThickness( options.thickness );
    if( options.point ) this.setPoint( options.point, options.object );
    if( options.normal )this.setNormal( options.normal );
    
    this.setAsSelectionRoot( true );
  }
  
  setThickness( thickness ){
    this.thickness  = thickness;
  }
  
  setPoint( point, object ){
    this.point  = point;
    this.object = object;
  }

  setNormal( normal ){
    this.normal  = normal;
    this.escapePoint = this.point.clone().sub( normal.clone().normalize().multiplyScalar( this.thickness ));

    this.done();    
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
    
    var selectedObject = entryInteresect.object;
    if( !selectedObject ) return;
    
    var point = entryInteresect.point.clone();
    var flippedNormal = entryInteresect.face.normal.clone().negate();
    var offsetPoint = point.clone().add( flippedNormal.clone().multiplyScalar(1000));
    
    //get escape point
    var raycaster = new THREE.Raycaster(offsetPoint, normal.clone().normalize());
    var intersects = raycaster.intersectObjects([selectedObject], true);
    
    var escapePoint = null;
    var minDist = Infinity;
    for(var i=0;i<intersects.length;i++)
    {
      var curPt = intersects[i].point;
      var curLn = curPt.clone().sub( point ).length();
      
      if( curLn < minDist )
      {
        escapePoint = curPt;
        minDist = curLn;
      }
    }
    //compute actual thickness
    this.thickness = escapePoint.clone().sub( point).length();
    
    //set various internal attributes
    this.setPoint( point, entryInteresect.object);
    this.setNormal( normal );
    //this._drawDebugHelpers( point, offsetPoint, escapePoint, normal, flippedNormal);
    //this.done();
    
    ////
    try{
      var point = this.point.clone();
      var midPoint = this.escapePoint.clone().sub( point ).divideScalar( 2 ).add( point );
      console.log("midPoint", midPoint,point,this.escapePoint);
      var putSide = this.getTargetBoundsData(this.object, midPoint);
      
      this.thicknessHelperArrows.setFacingSide( new THREE.Vector3().fromArray( putSide ) );
      
      var foo = new SizeHelper({
        textColor:this.textColor, 
        textBgColor:this.textBgColor, 
        arrowsPlacement:"outside",
        labelType:"flat",
        sideLength:this.sideLength,
        length:20
      });
      //this.add( foo );
      
      
    
    }catch(error){
      console.error(error);
    }
    
    
  }

  unset(){
    //this.thickness = undefined;
    let options = Object.assign({}, this.DEFAULTS, options); 
    Object.assign(this, options);//unsure
    this.thicknessHelperArrows.hide();
  }

  //call this when everything has been set ?
  done(){
    this.thicknessHelperArrows.setStart( this.point );
    this.thicknessHelperArrows.setEnd( this.escapePoint );
    this.thicknessHelperArrows.show();
  }

  _drawDebugHelpers(point, offsetPoint, escapePoint, normal, flippedNormal){
    var faceNormalHelper  = new THREE.ArrowHelper(normal, point, 15, 0XFF0000);
    var faceNormalHelper2 = new THREE.ArrowHelper(flippedNormal,point, 15, 0X00FF00);
    var remotePointHelper = new CrossHelper({position:offsetPoint,color:0xFF0000});
    var escapePointHelper = new CrossHelper({position:escapePoint,color:0xFF0000});
    
    this.add( faceNormalHelper );
    this.add( faceNormalHelper2 );
    this.add( remotePointHelper );
    this.add( escapePointHelper );
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
      
    let foo = point.clone().sub( objectCenter );
    //console.log("objectCenter",objectCenter,"point", point,foo.normalize());
    
    let axes = ["x","y","z"];
    axes.forEach( (axis, index) => {
      let axisOffset  = point[axis] - objectCenter[axis];
      axisOffset = Math.round(axisOffset * 100) / 100;
      //console.log("axis",axis,axisOffset);
      if( axisOffset>0 ){
        //console.log(`in FRONT along ${axis}`);
        putSide[index] = 1;
      }
      else if( axisOffset<0 )
      {
        //console.log(`in BACK along ${axis}`);
        putSide[index] = -1;
      }
    });
    
    console.log("putSide",putSide);

    return putSide; 
  }  
}

module.exports = ThicknessHelper;
