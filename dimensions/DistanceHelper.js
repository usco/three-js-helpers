DistanceHelper = function(options)
{
  BaseHelper.call( this );
  var options = options || {};
  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0xFF0000;

  this.fontSize   = options.fontSize!== undefined ? options.fontSize : 10;
  this.textColor  = options.textColor!== undefined ? options.textColor : "#000";
  this.textBgColor= options.textBgColor!== undefined ? options.textBgColor : "#fff";
  this.labelPos   = options.labelPos!== undefined ? options.labelPos : "center";
  this.labelType  = options.labelType!== undefined ? options.labelType : "frontFacing";
  
  this.arrowHeadSize   = 4;
  this.start           = undefined;
  this.startObject     =  options.startObject!== undefined ? options.startObject : undefined;
  this.end             = undefined;
  this.endObject       = options.endObject!== undefined ? options.endObject : undefined;
  
  this.distance        = undefined;
  
  //initialise internal sub objects
  this.startCross = new CrossHelper();
  this.startCross.hide();
  this.add( this.startCross );
  
  this.sizeArrow = new SizeHelper( { drawRightArrow:false, arrowColor:this.arrowColor, 
    linesColor:this.arrowColor,
    textBgColor:this.textBgColor,textColor:this.textColor, labelType:
    this.labelType} ); 
  this.sizeArrow.hide();
  this.add( this.sizeArrow );
  
  if( options.start ) this.setStart( options.start, this.startObject );
  if( options.end )   this.setEnd( options.end, this.endObject );
 
}

DistanceHelper.prototype = Object.create( BaseHelper.prototype );
DistanceHelper.prototype.constructor = DistanceHelper;

DistanceHelper.prototype.toggleText = function(toggle)
{
  this.label.visible = toggle;
  //Fixme:
  this.label.textSprite.visible = toggle;
}


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
}

DistanceHelper.prototype.unset = function( )
{
  //this.remove( this.startCross );
  //this.remove( this.arrow );
  this.startCross.hide();
  this.sizeArrow.hide();
}

DistanceHelper.prototype.update = function(){
  //TODO: find a way to only call this when needed
  if(!this.visible) return;
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
}
