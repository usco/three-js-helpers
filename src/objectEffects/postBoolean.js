//TODO:develop this further: visual effect to make csg effects more clear

function BooleanOperandsEffect()
{
}

BooleanOperandsEffect.prototype.apply = function ( operands )
{
  for(var i=0; i<operands.length;i++)
  {
    var operand = operands[i];
    operand.renderable.material.transparent=true; 
    operand.renderable.material.opacity =0.2;       
  }
}

BooleanOperandsEffect.prototype.reset = function ( operands )
{
  setTimeout(function(){
  for(var i=0;i<operands.length;i++)
  {
    operands[i].renderable.material.opacity = 1;
    operands[i].renderable.material.transparent=false; 
  }

  },5000);
}
