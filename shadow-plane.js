ShadowPlane = function (width, length, shadowColor, upVector) {

  THREE.Object3D.call( this );	
  this.width = width || 200;
  this.length = length || 200;
  this.shadowColor = shadowColor || new THREE.Color(1,1,1);
  this.upVector = upVector || new THREE.Vector3(0,1,0);

  this.userData.unselectable = true; // this should never be selectable
  this._drawPlane();
}
ShadowPlane.prototype = Object.create( THREE.Object3D.prototype );


ShadowPlane.prototype._drawPlane=function(){
  //create plane for shadow projection   
  var width = this.width;
  var length = this.length;
  var shadowColor = this.shadowColor;

  var planeGeometry = new THREE.PlaneBufferGeometry(-width, length, 1, 1);
      planeFragmentShader = [
      "uniform vec3 diffuse;",
      "uniform float opacity;",
      "uniform vec3 shadowColor;",
      THREE.ShaderChunk["color_pars_fragment"],
      THREE.ShaderChunk["map_pars_fragment"],
      THREE.ShaderChunk["lightmap_pars_fragment"],
      THREE.ShaderChunk["envmap_pars_fragment"],
      THREE.ShaderChunk["fog_pars_fragment"], 
      THREE.ShaderChunk["shadowmap_pars_fragment"], 
      THREE.ShaderChunk["specularmap_pars_fragment"], 
      "void main() {",
      	"gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );",
      	THREE.ShaderChunk["map_fragment"],
      	THREE.ShaderChunk["alphatest_fragment"], 
      	THREE.ShaderChunk["specularmap_fragment"], 
      	THREE.ShaderChunk["lightmap_fragment"], 
      	THREE.ShaderChunk["color_fragment"], 
      	THREE.ShaderChunk["envmap_fragment"], 
      	THREE.ShaderChunk["shadowmap_fragment"], 
      	THREE.ShaderChunk["linear_to_gamma_fragment"], 
      	THREE.ShaderChunk["fog_fragment"], 
      	"gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 - shadowColor.x );",
      	"}"
      	].join("\n");
      	
      //= vec3(0.0,0.0,0.0) 
      var uniforms = THREE.ShaderLib['basic'].uniforms;
      if( ! ("shadowColor" in uniforms) ) {uniforms["shadowColor"] = {type:'c',value:shadowColor }; }
  
      planeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: THREE.ShaderLib['basic'].vertexShader,
        fragmentShader: planeFragmentShader,
        color: 0x0000FF,
        transparent: true
      });
     
      //create plane for shadow projection    
      this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
      this.plane.rotation.x = Math.PI;
      this.plane.position.z = -0.2;
      this.name = "shadowPlane";
      this.plane.receiveShadow = true;
      this.plane.castShadow    = false;
      
      this.add(this.plane);
}


ShadowPlane.prototype.setUp = function(upVector) {
  this.upVector = upVector;
  this.up = upVector;
  this.lookAt(upVector);
};
      
