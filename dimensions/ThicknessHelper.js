ThicknessHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  
  
  this.normalType  = options.normalType !== undefined ? options.normalType : "face";//can be, face, x,y,z
  
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0x000000;
  this.linesColor = options.linesColor !== undefined ? options.linesColor : 0x000000;
  
  this.sideLength    = options.sideLength!== undefined ? options.sideLength : 10; 
  
  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#ffd200";
  this.labelType  = options.labelType!== undefined ? options.labelType : "frontFacing";
  
  
  this.debug      = options.debug!== undefined ? options.debug : false;
  this.thickness  = options.thickness!== undefined ? options.thickness : undefined;
}

ThicknessHelper.prototype = Object.create( BaseHelper.prototype );
ThicknessHelper.prototype.constructor = ThicknessHelper;

ThicknessHelper.prototype.set = function(entryInteresect, selectedObject)
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
      
  var point = entryInteresect.point.clone();
  var flippedNormal = entryInteresect.face.normal.clone().negate();
  var offsetPoint = point.clone().add( flippedNormal.clone().multiplyScalar(1000));
  
  //get escape point
  if( !selectedObject ) return; //FIXME, should work without selection?
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
  
  this._drawThickness( point, offsetPoint, escapePoint, normal, flippedNormal );
  //this._drawDebugHelpers( point, offsetPoint, escapePoint, normal, flippedNormal);
  //this._drawLabel( point, escapePoint);
}

ThicknessHelper.prototype.unset = function(){
  this.remove( this.thicknessHelper );
}

ThicknessHelper.prototype._drawThickness = function(point, offsetPoint, escapePoint, normal, flippedNormal){
  this.thicknessHelper = new SizeHelper({length:this.thickness, 
  textColor:this.textColor, textBgColor:this.textBgColor, arrowsPlacement:"outside",start: point, end:escapePoint,
  labelType:"frontFacing",sideLength:this.sideLength
  });
  this.thicknessHelper.set();
  this.add( this.thicknessHelper );
}

ThicknessHelper.prototype._drawDebugHelpers = function(point, offsetPoint, escapePoint, normal, flippedNormal){
  var faceNormalHelper  = new THREE.ArrowHelper(normal, point, 15, 0XFF0000);
  var faceNormalHelper2 = new THREE.ArrowHelper(flippedNormal,point, 15, 0X00FF00);
  var remotePointHelper = new CrossHelper({position:offsetPoint,color:0xFF0000});
  var escapePointHelper = new CrossHelper({position:escapePoint,color:0xFF0000});
  
  this.add( faceNormalHelper );
  this.add( faceNormalHelper2 );
  this.add( remotePointHelper );
  this.add( escapePointHelper );
}
