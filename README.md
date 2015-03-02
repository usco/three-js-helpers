three-js-helpers
============================

Set of helper custom elements for the three-js custom element system ( https://github.com/usco/three-js)

installation
------------

    bower install --save usco/three-js-helpers


usage:
------

  - include the custom elements you need:

        <link rel="import" href="components/three-js-helpers/axis-helper.html">
        <link rel="import" href="components/three-js-helpers/grid-helper.html">


  - used them within a three-js scene:

        <three-js-scene name="helpers" active>
            <axis-helper> </axis-helper>
            <grid-helper> </grid-helper>
        </three-js-scene>


Notes:
=====

- all custom elements only work in the context of a three-js scene , see https://github.com/usco/three-js


NODE.js/browserify:
===================

- annotations etc need to be rebuilt & browserified first : so use:

  * npm install
  
  Build dimensions:
  
      browserify -s uscoDimensions src/dimensions/usco-dimensions.js -t babelify --outfile lib/usco-dimensions.js
      
  for now
      
      browserify -s ObjectDimensionsHelper src/dimensions/usco-dimensions.js -t babelify --outfile lib/usco-dimensions.js

  Build annotations
  
      browserify -s uscoAnnotations src/annotations/usco-annotations.js -t babelify --outfile lib/usco-annotations.js


Licence
=======
MIT
