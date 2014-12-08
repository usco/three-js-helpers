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
  //this.startCross.hide();
  this.add( this.startCross ) ;
  
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

DistanceHelper.prototype.set = function( options )
{
  var options = options || {};
  var start   = options.start !== undefined ? options.start.clone() : new THREE.Vector3();
  var end     = options.end !== undefined ? options.end.clone()   : new THREE.Vector3(10,0,0);
  var direction = new THREE.Vector3(1,0,0);
  
  if(end && start)
  {
    direction = end.clone().sub( start.clone() );
    options.length = direction.length();
  }
  
  //console.log("start", start, "end", end, "length", options.length,"direction", direction);
  
  var length = options.length !== undefined ? options.length : 50;
  var textSize  = options.textSize  !== undefined? options.textSize: 10;
  var precision = options.precision !== undefined? options.precision: 2;
  var text   = options.text !== undefined   ? options.text   : length.toFixed(precision) + "";//coerce as str

  //FIXME:hack
  this.direction = direction;
  this.length = length;
  this.text = text;
  
  //main arrow
  var dirNorm = direction.clone().normalize();
  this.arrow = new SizeHelper( {start:start,length:length,direction:dirNorm,
  drawRightArrow:false, arrowColor:this.arrowColor, linesColor:this.arrowColor,
  textBgColor:this.textBgColor,textColor:this.textColor, labelType:
  this.labelType} );
  this.arrow.set();
  this.add( this.arrow ) ;
  
}

/*start: vector3D
object: optional : on which object is the start point
*/
DistanceHelper.prototype.setStart = function( start, object )
{
  if(!start) return;
  this.start = start;
  this.startObject = object;
  
  //console.log("setting start",start, object, object.worldToLocal(start.clone()) );
  
  //FIXME: experimental
  /*this.startWrapper = new THREE.Object3D();
  this.startWrapper.position = this.start ;
  this.startObject.add( this.startWrapper);*/
  //this.position.copy( object.position );
  this.curStartObjectPos = object.position.clone();
  
  if( object ){
    var bar = start.clone();
    //object.worldToLocal( bar );
    //this.
    
    //this.start = start = object.worldToLocal( start );
  }
  this.startCross.show();
  this.startCross.position.copy( this.start );
}

DistanceHelper.prototype.setEnd = function( end, object )
{
  if(!end) return;
  this.end = end;
  this.endObject = object;
  
  //if( object ){
  //  this.end = end = object.worldToLocal( end );
  //}
  //FIXME: experimental
  this.curEndObjectPos = object.position.clone();
  
  this.distance = end.clone().sub(this.start).length();
  
  //FIXME: hack for now
  //this.set({start:this.start, end:this.end});
}

DistanceHelper.prototype.unset = function( )
{
  //this.remove( this.startCross );
  this.remove( this.arrow );
}

DistanceHelper.prototype.update = function(){
  //TODO: find a way to only call this when needed
  if(!this.visible) return;
  var changed = false;
  this.startObject.updateMatrix();
  this.endObject.updateMatrix();
  
  this.startObject.updateMatrixWorld();
  this.endObject.updateMatrixWorld();
  
  
  if( ! this.startObject.position.equals( this.curStartObjectPos ) )
  {
    var offset = this.startObject.position.clone().sub( this.curStartObjectPos );
    console.log("STARTchange",offset);
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
  if( ! this.endObject.position.equals( this.curEndObjectPos ) &&  this.startObject !== this.endObject)
  {
        console.log("ENDchange");
    var offset = this.endObject.position.clone().sub( this.curEndObjectPos );
    this.curEndObjectPos.copy( this.endObject.position );
    this.end.add( offset );
    //this.setEnd(this.end.clone().add( offset ) , this.endObject );
    
    changed = true;
  }
  if(changed){
     console.log("change");
     this.distance = this.end.clone().sub(this.start).length();
     this.unset();
     this.set({start:this.start, end:this.end});
  }
  
  ///console.log("s",this.start, "e",this.end);
  //this.unset();
  //this.set({start:this.start, end:this.end});
}
