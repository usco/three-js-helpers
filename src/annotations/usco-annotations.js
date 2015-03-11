require("babel/polyfill");

exports.AnnotationHelper = require("./AnnotationHelper.js" );
exports.DistanceHelper   = require("./DistanceHelper.js" );
exports.NoteHelper       = require("./NoteHelper.js" );
exports.DiameterHelper   = require("./DiameterHelper.js" );
exports.AngDimHelper     = require("./AngularDimensionsHelper.js" );
exports.ThicknessHelper  = require("./ThicknessHelper.js" );

//FIXME: temporary hack
window.AnnotationHelper   = exports.AnnotationHelper;
window.DistanceHelper     = exports.DistanceHelper;
window.DiameterHelper     = exports.DiameterHelper;
window.NoteHelper         = exports.NoteHelper;
window.ThicknessHelper    = exports.ThicknessHelper;
window.AngDimHelper      = exports.AngDimHelper;

var {LabelHelperPlane, LabelHelper3d} = require("../LabelHelper");
window.LabelHelperPlane = exports.LabelHelperPlane  = LabelHelperPlane;
