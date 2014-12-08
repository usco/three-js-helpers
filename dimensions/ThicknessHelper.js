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
  this.object     = undefined;
  this.point      = undefined;
  this.normal     = undefined;
  
  if( options.thickness )this.setThickness( options.thickness );
  if( options.point ) this.setPoint( options.point );
  if( options.normal )this.setNormal( options.normal );
  
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
  //set various internal attributes
  this.point  = point;
  this.normal = normal;
  this.object = entryInteresect.object;
  
  this._drawThickness( point, escapePoint, normal );
  //this._drawDebugHelpers( point, offsetPoint, escapePoint, normal, flippedNormal);
  //this._drawLabel( point, escapePoint);
}

ThicknessHelper.prototype.setThickness = function( thickness ){
    this.thickness  = thickness;
}

ThicknessHelper.prototype.setPoint = function( point, object ){
    this.point  = point;
    this.object = object;
    
    //FIXME: not needed if this helper becomes a child of the measured object
    if(object) this._curObjectPos = object.position.clone();
}


ThicknessHelper.prototype.setNormal = function( normal ){
    this.normal  = normal;
    var escapePoint = this.point.clone().sub( normal.clone().normalize().multiplyScalar( this.thickness ));
    
    this._drawThickness( this.point, escapePoint, normal );
}


ThicknessHelper.prototype.unset = function(){
  this.remove( this.thicknessHelperArrows );
  this.remove( this.thicknessHelperLabel );
}

ThicknessHelper.prototype._drawThickness = function(point, escapePoint, normal){
  this.thicknessHelperArrows = new SizeHelper({length:this.thickness, 
  textColor:this.textColor, textBgColor:this.textBgColor, arrowsPlacement:"outside",start: point, end:escapePoint,
  labelType:"frontFacing",sideLength:0, drawLabel:false
  });
  this.thicknessHelperArrows.set();
  
  this.thicknessHelperLabel = new SizeHelper({length:this.thickness, 
  textColor:this.textColor, textBgColor:this.textBgColor, arrowsPlacement:"outside",start: point, end:escapePoint,
  labelType:"frontFacing",sideLength:this.sideLength, drawArrows:false
  });
  this.thicknessHelperLabel.set();
  
  
  this.add( this.thicknessHelperLabel );
  this.add( this.thicknessHelperArrows );
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

ThicknessHelper.prototype.update = function(){
  //TODO: find a way to only call this when needed
  if(!this.visible) return;
  var changed = false;
  this.object.updateMatrix();
  this.object.updateMatrixWorld();
  
  if( ! this.object.position.equals( this.curObjectPos ) )
  {
    var offset = this.startObject.position.clone().sub( this.curStartObjectPos );
    //console.log("STARTchange",offset);
    //this.curStartObjectPos.copy( this.startObject.position );
    //this.startCross.position.add( offset );
    //this.start.add( offset );
    if(!this.start) return;
    this.setStart(this.start.clone().add( offset ), this.startObject );
    
    //this.set({start:this.start, end:this.end});
    if(this.startObject === this.endObject)
    {
      this.setEnd(this.end.clone().add( offset ), this.endObject );
      //this.end.add(offset);
    }
    
    changed = true;
  }

  if(changed){
     //console.log("change");
     this.distance = this.end.clone().sub(this.start).length();
     this.unset();
     this.set({start:this.start, end:this.end});
  }
  
}

