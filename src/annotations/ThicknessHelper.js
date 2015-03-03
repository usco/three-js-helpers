var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");

class ThicknessHelper extends AnnotationHelper {
  constructor( options ) {
    const DEFAULTS = {
        normalType:  "face";//can be, face, x,y,z
        arrowColor: 0x000000,
        linesColor: 0x000000,
        sideLength: 10,
        fontSize: 10,
        textColor:"#000",
        textBgColor:"#ffd200",
        labelType:"frontFacing",
        debug:false,
        thickness:undefined,
    };
    
    let options = Object.assign({}, DEFAULTS, options); 
    super(options);
    
    this.object     = undefined;
    this.point      = undefined;
    this.normal     = undefined;
    
    //initialise internal sub objects
    this.thicknessHelperArrows = new SizeHelper({
    textColor:this.textColor, textBgColor:this.textBgColor, arrowsPlacement:"outside",
    labelType:"frontFacing",sideLength:0, drawLabel:false
    });
    this.thicknessHelperArrows.hide();
    this.add( this.thicknessHelperArrows );
    
    this.thicknessHelperLabel = new SizeHelper({
    textColor:this.textColor, textBgColor:this.textBgColor, arrowsPlacement:"outside",
    labelType:"frontFacing",sideLength:this.sideLength, drawArrows:false
    });
    
    this.thicknessHelperLabel.hide();
    this.add( this.thicknessHelperLabel );
    
    if( options.thickness )this.setThickness( options.thickness );
    if( options.point ) this.setPoint( options.point );
    if( options.normal )this.setNormal( options.normal );
    
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

  set(entryInteresect )//, selectedObject)
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
    this.done();
  }

  unset(){
    this.thicknessHelperArrows.hide();
    this.thicknessHelperLabel.hide();
  }

  //call this when everything has been set ?
  done(){
    this.thicknessHelperArrows.show();
    this.thicknessHelperArrows.setStart( this.point );
    this.thicknessHelperArrows.setEnd( this.escapePoint );
    
    this.thicknessHelperLabel.show();
    this.thicknessHelperLabel.setStart( this.point );
    this.thicknessHelperLabel.setEnd( this.escapePoint );
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
}

module.exports = ThicknessHelper;
