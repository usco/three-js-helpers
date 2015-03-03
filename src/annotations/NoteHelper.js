var AnnotationHelper = require("./AnnotationHelper");
var CrossHelper = require("../CrossHelper");


/*
  Helper for basic notes (single point)
*/
class NoteHelper extends AnnotationHelper {
  constructor( options ) {
    const DEFAULTS = {
      crossColor:"#F00",
      text:"",
      title:"",
    };
    
    let options = Object.assign({}, DEFAULTS, options); 
    super(options);

    //initialise internal sub objects
    this.pointCross = new CrossHelper({size:2.5,color:this.crossColor});
    this.pointCross.hide();
    this.add( this.pointCross );
    
    
    this.point      = options.point!== undefined ? options.point : undefined;
    this.object     = options.object!== undefined ? options.object : undefined;
    
    if( options.point ) this.setPoint( this.point, this.object );
    
    this.setAsSelectionRoot( true );
    //FIXME: do this in a more coherent way
    this._setName();
  }
  
  unset( ){
    this.pointCross.hide();
  }

  setPoint( point, object ){
    if(point) this.point = point;
    if(object) this.object = object;

    //point location cross
    this.pointCross.position.copy( this.point );
    this.pointCross.show();
  }

  _setName( ){
    this.name = "Note: " + this.title;
  }
  
}

module.exports = NoteHelper;

