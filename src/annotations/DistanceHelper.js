var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");
var CrossHelper = require("../CrossHelper");

class DistanceHelper extends AnnotationHelper {
  constructor( options ) {
  
    const DEFAULTS = {
      crossSize: 3,
      crossColor: "#000",
      
      distance:undefined,
      start:undefined,
      startObject:undefined,
      end: undefined,
      endObject: undefined
    }
    
    let options = Object.assign({}, DEFAULTS, options); 
    
    super( options );    
    Object.assign(this, options);
  
    //initialise internal sub objects
    this._setupVisuals();
    this._computeBasics();
   
    this.updatable = false;
    this.setAsSelectionRoot( true );
    //FIXME: do this in a more coherent way
    this._setName();
  }
  
  
  //getters & setters
  /*get start () {
    return this._start;
  }
  set start (val) {
    console.log("setting start",val);
    var start = this._start = val;
    this._computeStartHooks();
    
    if(!this.startCross ) return;
    this.startCross.position.copy( this.start );
    this.startCross.show();
  }
  
  get startObject () {
    return this._startObject;
  }
  set startObject (val) {
    console.log("setting start object",val);
    var startObject = this._startObject = val;
    this._computeStartHooks();
  }
  
  get end() {
    return this._end;
  }
  set end(val) {
    console.log("setting end",val);
    var start = this._end = val;
    this._computeEndHooks();
  }
  
  get endObject () {
    return this._endObject;
  }
  set endObject (val) {
    console.log("setting end object",val);
    var endObject = this._endObject = val;
    this._computeEndHooks();
  }

  _computeStartHooks(){
  
    if(!this.start || !this.startObject) return;
    this.curStartObjectPos = this.startObject.position.clone();
    
    this._startOffset = this.start.clone().sub( this.curStartObjectPos );
    if(!this._startHook){
      this._startHook = new THREE.Object3D();
      this._startHook.position.copy( this.start.clone().sub( this.startObject.position ) );//object.worldToLocal(this.start) );
      this.startObject.add( this._startHook );
    }
  }
  
  _computeEndHooks(){
    if(!this.end || !this.endObject) return;
    
    //FIXME: experimental
    this.curEndObjectPos = this.endObject.position.clone();

    this._endOffset = this.end.clone().sub( this.curEndObjectPos );
    
    if(!this._endHook){
      this._endHook = new THREE.Object3D();
      this._endHook.position.copy( this.end.clone().sub( this.endObject.position ) );//object.worldToLocal(this.end) );
      this.endObject.add( this._endHook );
    }
    
    this._computeBasics();
  }*/
  
  _computeBasics(){
    var start          = this.start;
    var end            = this.end;
    var startObject    = this.startObject;
    var endObject      = this.endObject;
    
    if( ! start || ! end || ! startObject || ! endObject ) return;
    
    var endToStart = end.clone().sub( start )
    this.distance = endToStart.length();
    
    try{
      var midPoint = endToStart.divideScalar( 2 ).add( start );
      this._putSide = this.getTargetBoundsData(startObject, midPoint);
    }catch(error){
      console.error(error);
    }
    
    //all done, now update the visuals
    this._updateVisuals();
    
    this.sizeArrow.show();
    this.startCross.show();
  }
  
  /*configure all the basic visuals of this helper*/
  _setupVisuals(){
    this.startCross = new CrossHelper({size:this.crossSize,color:this.crossColor});
    this.startCross.hide();
    this.add( this.startCross );
      
    this.sizeArrow = new SizeHelper( { 
      textColor:this.textColor, 
      textBgColor:this.textBgColor, 
      fontSize:this.fontSize,
      fontFace:this.fontFace,
      labelType:this.labelType,
      arrowColor: this.arrowColor,
      sideLength:this.sideLength,//6
      sideLineColor:this.arrowColor,
      sideLineSide:"back"} );
      
    this.sizeArrow.hide();
    this.add( this.sizeArrow );
  }
  
  _updateVisuals(){
    this.sizeArrow.setFromParams( {
      start:this.start,
      end:this.end,
      facingSide:this._putSide,
    });
    
    this.startCross.position.copy( this.start );
  }
  
  /*start: vector3D
  object: optional : on which object is the start point
  */
  setStart( start, object )
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
    
    this.startCross.position.copy( this.start );
    this.sizeArrow.setStart( this.start );
  }

  setEnd( end, object )
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

  unset( )
  {
    this.startCross.hide();
    this.sizeArrow.hide();
    
    this._endHook = null;
    this._startHook = null;
  }


  /*brute force update method, to update the star & end positions
  when the objects they are attached to change (position, rotation,scale)*/
  update( ){
    return;
    //TODO: find a way to only call this when needed
    if(!this.visible) return;
    if(!this.updatable) return;
    var changed = false;
    
    this.startObject.updateMatrix();
    this.startObject.updateMatrixWorld();
    this.endObject.updateMatrix();
    this.endObject.updateMatrixWorld();
    
    this.setStart( this.startObject.localToWorld( this._startHook.position.clone() ) );
    this.setEnd( this.endObject.localToWorld( this._endHook.position.clone()) );
    
    this._setName();
  }

  _setName( ){
    var tmpValue = this.distance;
    if( tmpValue ) tmpValue = tmpValue.toFixed( 2 );
    this.name = "Distance: " + tmpValue;
  }
  
}

module.exports = DistanceHelper;


