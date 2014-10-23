
/*
Center Helper
*/
CenterHelper = function(options)
{
  BaseHelper.call( this );
  
  var type = this.type = options.type || "mark";//line or mark
  var size = this.size = options.size || 5 ;
  var dia  = this.dia = options.dia || 10;
  
  if(type == "mark")
  {
    var markCross = new CrossHelper({size:size});
    this.add( markCross );
  }
  else if(type == "line")
  {
    var markCross = new CrossHelper({size:size});
    this.add( markCross );
    
    var lineCross = new CrossHelper({size:size,id:dia});
    this.add( lineCross );
  }

}

CenterHelper.prototype = Object.create( BaseHelper.prototype );
CenterHelper.prototype.constructor = CenterHelper;
