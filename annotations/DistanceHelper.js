DistanceHelper = function(options)
{
  AnnotationHelper.call( this );
  var options = options || {};
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0xFF0000;

  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "flat";
 
  this.crossSize  = options.crossSize!== undefined ? options.crossSize : 3;
  this.crossColor = options.crossColor!== undefined ? options.crossColor : "#000";
  
  //FIXME: hack
  this.textColor = "#ff0077";
  this.arrowColor = this.textColor;
  this.crossColor = this.textColor;
  
  this.arrowHeadSize   = 4;
  this.start           = undefined;
  this.startObject     =  options.startObject!== undefined ? options.startObject : undefined;
  this.end             = undefined;
  this.endObject       = options.endObject!== undefined ? options.endObject : undefined;
  
  this.distance        = undefined;
  
  //initialise internal sub objects
  this.startCross = new CrossHelper({size:this.crossSize,color:this.crossColor});
  this.startCross.hide();
  this.add( this.startCross );
  
  //FIXME: side of sideLineSide needs to be dynamic
  
  this.sizeArrow = new SizeHelper( { arrowColor:this.arrowColor, 
    sideLineColor:this.textColor,
    textBgColor:this.textBgColor,textColor:this.textColor, labelType:
    this.labelType,sideLength:6,sideLineSide:"back"} );
    
     
  this.sizeArrow.hide();
  this.add( this.sizeArrow );
  
  if( options.start ) this.setStart( options.start, this.startObject );
  if( options.end )   this.setEnd( options.end, this.endObject );
 
  this.updatable = false;
  
  this.setAsSelectionRoot( true );
  //FIXME: do this in a more coherent way
  this._setName();
}

DistanceHelper.prototype = Object.create( AnnotationHelper.prototype );
DistanceHelper.prototype.constructor = DistanceHelper;

/*start: vector3D
object: optional : on which object is the start point
*/
DistanceHelper.prototype.setStart = function( start, object )
{
  if(!start) return;
  this.start = start;
  if( object) this.startObject = object;
  var object = this.startObject;
  //console.log("setting start",start, object, object.worldToLocal(start.clone()) );
  
  //FIXME: experimental
  this.curStartObjectPos = object.position.clone();
  
  this._startOffset = start.clone().sub( this.curStartObjectPos );
  if(!this._startHook){
    this._startHook = new THREE.Object3D();
    this._startHook.position.copy( this.start.clone().sub( object.position ) );//object.worldToLocal(this.start) );
    object.add( this._startHook );
  }
  
  this.startCross.show();
  this.startCross.position.copy( this.start );
  
  this.sizeArrow.setStart( this.start );
}

DistanceHelper.prototype.setEnd = function( end, object )
{
  if(!end) return;
  this.end = end;
  if( object) this.endObject = object;
  
  var object = this.endObject;
  
  //FIXME: experimental
  this.curEndObjectPos = object.position.clone();

  this._endOffset = end.clone().sub( this.curEndObjectPos );
  
  if(!this._endHook){
    this._endHook = new THREE.Object3D();
    this._endHook.position.copy( this.end.clone().sub( object.position ) );//object.worldToLocal(this.end) );
    object.add( this._endHook );
  }
  
  this.distance = end.clone().sub(this.start).length();
  
  this.sizeArrow.setEnd( this.end);
  this.sizeArrow.show();
  
    //this.sizeArrow.label.textMesh.material.opacity = 0.1;
}

DistanceHelper.prototype.unset = function( )
{
  this.startCross.hide();
  this.sizeArrow.hide();
  
  this._endHook = null;
  this._startHook = null;
}

DistanceHelper.prototype.update = function(){
  //TODO: find a way to only call this when needed
  if(!this.visible) return;
  if(!this.updatable) return;
  var changed = false;
  
  this.startObject.updateMatrix();
  this.startObject.updateMatrixWorld();
  this.endObject.updateMatrix();
  this.endObject.updateMatrixWorld();
  
  /*if( ! this.startObject.position.equals( this.curStartObjectPos ) )
  {
    var offset = this.startObject.position.clone().sub( this.curStartObjectPos );
    console.log("STARTchange",offset);
    //this.curStartObjectPos.copy( this.startObject.position );
    //this.startCross.position.add( offset );
    //this.start.add( offset );
    //if(!this.start) return;
    //this.setStart(this.start.clone().add( offset ), this.startObject );
    
    //this.set({start:this.start, end:this.end});
    if(this.startObject === this.endObject)
    {
      this.setEnd(this.end.clone().add( offset ), this.endObject );
      //this.end.add(offset);
    }
    
    changed = true;
  }*/
  /*if( ! this.endObject.position.equals( this.curEndObjectPos ) &&  this.startObject !== this.endObject)
  {

    var offset = this.endObject.position.clone().sub( this.curEndObjectPos );
    this.curEndObjectPos =  this.endObject.position.clone();//.copy( this.endObject.position );
    this.end.copy( this.end.add( offset ) );
    
    console.log("ENDchange",offset,offset.length() );
    //this.setEnd(this.end.clone().add( offset ) , this.endObject );
    changed = true;
  }
  if(changed){
     //console.log("change");
     this.distance = this.end.clone().sub(this.start).length();
     //this.unset();
     //this.set({start:this.start, end:this.end});
     this.sizeArrow.setStart( this.start );
     this.sizeArrow.setEnd( this.end);
  }*/
  
  
  //this.sizeArrow.setStart( this.startObject.position.clone().add( this._startOffset) );
  //this.sizeArrow.setEnd( this.endObject.position.clone().add( this._endOffset) );
  
  //this.setStart( this.startObject.position.clone().add( this._startOffset) );
  //this.setEnd( this.endObject.position.clone().add( this._endOffset) );
  //this.setStart( this._startHook.position );
  //this.setEnd( this._endHook.position );
  
  //this.sizeArrow.setStart( this.startObject.localToWorld( this._startHook.position.clone() ));
  //this.sizeArrow.setEnd( this.endObject.localToWorld( this._endHook.position.clone()) );
  
  this.setStart( this.startObject.localToWorld( this._startHook.position.clone() ) );
  this.setEnd( this.endObject.localToWorld( this._endHook.position.clone()) );
  
  this._setName();
}

DistanceHelper.prototype._setName = function( ){
  var tmpValue = this.distance;
  if( tmpValue ) tmpValue = tmpValue.toFixed( 2 );
  this.name = "Distance: " + tmpValue;
}
