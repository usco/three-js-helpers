

/* defines a set of "UI steps" (taps, swipe etc) , which taken togetether are an "interaction

*/
class Interaction {

}


/*
  attributes are read from the targetObject one after the other
  ie: 
   ["start","mid","end"] will first deal with start, then mid , then end
*/
class NTaps {
  constructor:(target,attibutes=[],useSetters){
    this.nbTaps  = 0;
    this.attributes = attributes;
    this.maxTaps = attributes.length();
    this.target = target;
    //this.maxTaps = maxTaps;
  }
  
  next:(){
    this.nbTaps += 1;
    if( this.nbTaps >= this.maxTaps ){
      this.nbTap = 0;
    }
  }
  
  nextSetValue:(value){
    var curAttr = this.attributes[ this.nbTaps ];
    this.target[curAttr] = value;
    this.nbTaps += 1;
    if( this.nbTaps >= this.maxTaps ){
      this.nbTap = 0;
    }
  }
}
