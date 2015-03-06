!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.uscoAnnotations=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":2,"regenerator-babel/runtime":3}],2:[function(require,module,exports){
/**
 * Core.js 0.6.1
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , parseInt        = global.parseInt
  , isFinite        = global.isFinite
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , console         = global.console || {}
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return toString.call(it).slice(8, -1);
}
function classof(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , pow    = Math.pow
  , abs    = Math.abs
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}
function lz(num){
  return num > 9 ? num : '0' + num;
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
      try {
        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
      } catch(e){}
    }()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_TAG         = getWellKnownSymbol(TO_STRING_TAG)
  , SYMBOL_SPECIES     = getWellKnownSymbol('species')
  , SYMBOL_ITERATOR;
function setSpecies(C){
  if(DESC && (framework || !isNative(C)))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

/******************************************************************************
 * Module : common.export                                                     *
 ******************************************************************************/

var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // extend global
    if(framework && target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
    // export
    if(exports[key] != out)hidden(exports, key, exp);
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : common.iterators                                                  *
 ******************************************************************************/

SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR);
var ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
    // Safari has byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  FF_ITERATOR in ArrayProto && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function checkDangerIterClosing(fn){
  var danger = true;
  var O = {
    next: function(){ throw 1 },
    'return': function(){ danger = false }
  };
  O[SYMBOL_ITERATOR] = returnThis;
  try {
    fn(O);
  } catch(e){}
  return danger;
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)ret.call(iterator);
}
function safeIterClose(exec, iterator){
  try {
    exec(iterator);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
function forOf(iterable, entries, fn, that){
  safeIterClose(function(iterator){
    var f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false){
      return closeIterator(iterator);
    }
  }, getIterator(iterable));
}

/******************************************************************************
 * Module : es6.symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR || getWellKnownSymbol(ITERATOR),
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
  
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6.object.statics                                                *
 ******************************************************************************/

!function(){
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
}();

/******************************************************************************
 * Module : es6.object.prototype                                              *
 ******************************************************************************/

!function(tmp){
  // 19.1.3.6 Object.prototype.toString()
  tmp[SYMBOL_TAG] = DOT;
  if(cof(tmp) != DOT)hidden(ObjectProto, TO_STRING, function(){
    return '[object ' + classof(this) + ']';
  });
}({});

/******************************************************************************
 * Module : es6.object.statics-accept-primitives                              *
 ******************************************************************************/

!function(){
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] = MODE == 1 ? function(it){
        return isObject(it) ? fn(it) : it;
      } : MODE == 2 ? function(it){
        return isObject(it) ? fn(it) : true;
      } : MODE == 3 ? function(it){
        return isObject(it) ? fn(it) : false;
      } : MODE == 4 ? function(it, key){
        return fn(toObject(it), key);
      } : function(it){
        return fn(toObject(it));
      };
      try { fn(DOT) }
      catch(e){ f = 1 }
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
}();

/******************************************************************************
 * Module : es6.function                                                      *
 ******************************************************************************/

!function(NAME){
  // 19.2.4.2 name
  NAME in FunctionProto || (DESC && defineProperty(FunctionProto, NAME, {
    configurable: true,
    get: function(){
      var match = String(this).match(/^\s*function ([^ (]*)/)
        , name  = match ? match[1] : '';
      has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
      return name;
    },
    set: function(value){
      has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
    }
  }));
}('name');

/******************************************************************************
 * Module : es6.number.constructor                                            *
 ******************************************************************************/

Number('0o1') && Number('0b1') || function(_Number, NumberProto){
  function toNumber(it){
    if(isObject(it))it = toPrimitive(it);
    if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
      var binary = false;
      switch(it.charCodeAt(1)){
        case 66 : case 98  : binary = true;
        case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
      }
    } return +it;
  }
  function toPrimitive(it){
    var fn, val;
    if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
    if(isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
  }
  forEach.call(DESC ? getNames(_Number)
  : array('MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY'), function(key){
    key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
  });
  Number[PROTOTYPE] = NumberProto;
  NumberProto[CONSTRUCTOR] = Number;
  hidden(global, NUMBER, Number);
}(Number, Number[PROTOTYPE]);

/******************************************************************************
 * Module : es6.number.statics                                                *
 ******************************************************************************/

!function(isInteger){
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
// 20.1.2.3 Number.isInteger(number)
}(Number.isInteger || function(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
});

/******************************************************************************
 * Module : es6.math                                                          *
 ******************************************************************************/

// ECMAScript 6 shim
!function(){
  // 20.2.2.28 Math.sign(x)
  var E    = Math.E
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , sign = Math.sign || function(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
    
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
}();

/******************************************************************************
 * Module : es6.string                                                        *
 ******************************************************************************/

!function(fromCharCode){
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
}(String.fromCharCode);

/******************************************************************************
 * Module : es6.array.statics                                                 *
 ******************************************************************************/

!function(){
  $define(STATIC + FORCED * checkDangerIterClosing(Array.from), ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , mapfn   = arguments[1]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
        , index   = 0
        , length, result, step;
      if(isIterable(O)){
        result = new (generic(this, Array));
        safeIterClose(function(iterator){
          for(; !(step = iterator.next()).done; index++){
            result[index] = mapping ? f(step.value, index) : step.value;
          }
        }, getIterator(O));
      } else {
        result = new (generic(this, Array))(length = toLength(O.length));
        for(; length > index; index++){
          result[index] = mapping ? f(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }
  });
  
  $define(STATIC, ARRAY, {
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  
  setSpecies(Array);
}();

/******************************************************************************
 * Module : es6.array.prototype                                               *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  
  if(framework){
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }
}();

/******************************************************************************
 * Module : es6.iterators                                                     *
 ******************************************************************************/

!function(at){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return iterResult(1);
    }
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
}(createPointAt(true));

/******************************************************************************
 * Module : es6.regexp                                                        *
 ******************************************************************************/

DESC && !function(RegExpProto, _RegExp){  
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
    RegExp = function RegExp(pattern, flags){
      return new _RegExp(cof(pattern) == REGEXP && flags !== undefined
        ? pattern.source : pattern, flags);
    }
    forEach.call(getNames(_RegExp), function(key){
      key in RegExp || defineProperty(RegExp, key, {
        configurable: true,
        get: function(){ return _RegExp[key] },
        set: function(it){ _RegExp[key] = it }
      });
    });
    RegExpProto[CONSTRUCTOR] = RegExp;
    RegExp[PROTOTYPE] = RegExpProto;
    hidden(global, REGEXP, RegExp);
  }
  
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')defineProperty(RegExpProto, 'flags', {
    configurable: true,
    get: createReplacer(/^.*\/(\w*)$/, '$1')
  });
  
  setSpecies(RegExp);
}(RegExp[PROTOTYPE], RegExp);

/******************************************************************************
 * Module : web.immediate                                                     *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(run, 0, id);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6.promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, RECORD){
    function isThenable(it){
      var then;
      if(isObject(it))then = it.then;
      return isFunction(then) ? then : false;
    }
    function handledRejectionOrHasOnRejected(promise){
      var record = promise[RECORD]
        , chain  = record.c
        , i      = 0
        , react;
      if(record.h)return true;
      while(chain.length > i){
        react = chain[i++];
        if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
      }
    }
    function notify(record, reject){
      var chain = record.c;
      if(reject || chain.length)asap(function(){
        var promise = record.p
          , value   = record.v
          , ok      = record.s == 1
          , i       = 0;
        if(reject && !handledRejectionOrHasOnRejected(promise)){
          setTimeout(function(){
            if(!handledRejectionOrHasOnRejected(promise)){
              if(NODE){
                if(!process.emit('unhandledRejection', value, promise)){
                  // default node.js behavior
                }
              } else if(isFunction(console.error)){
                console.error('Unhandled promise rejection', value);
              }
            }
          }, 1e3);
        } else while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              if(!ok)record.h = true;
              ret = cb === true ? value : cb(value);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(value);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(value){
      var record = this
        , then, wrapper;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      try {
        if(then = isThenable(value)){
          wrapper = {r: record, d: false}; // wrap
          then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          record.v = value;
          record.s = 1;
          notify(record);
        }
      } catch(err){
        reject.call(wrapper || {r: record, d: false}, err); // wrap
      }
    }
    function reject(value){
      var record = this;
      if(record.d)return;
      record.d = true;
      record = record.r || record; // unwrap
      record.v = value;
      record.s = 2;
      notify(record, true);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var record = {
        p: this,      // promise
        c: [],        // chain
        s: 0,         // state
        d: false,     // done
        v: undefined, // value
        h: false      // handled rejection
      };
      hidden(this, RECORD, record);
      try {
        executor(ctx(resolve, record, 1), ctx(reject, record, 1));
      } catch(err){
        reject.call(record, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), record = this[RECORD];
        record.c.push(react);
        record.s && notify(record);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && RECORD in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('record'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6.collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || !DESC || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(checkDangerIterClosing(function(O){ new C(O) })){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        if(entry.p)entry.p = entry.p.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6.reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getPrototypeOf(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getPrototypeOf(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = descriptor(0);
    }
    if(has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
      existingDescriptor.value = V;
      return defineProperty(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: function(target, argumentsList /*, newTarget*/){
      var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
        , instance = create(isObject(proto) ? proto : ObjectProto)
        , result   = apply.call(target, instance, argumentsList);
      return isObject(result) ? result : instance;
    },
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7.proposals                                                     *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://gist.github.com/WebReflection/9353781
    getOwnPropertyDescriptors: function(object){
      var O      = toObject(object)
        , result = {};
      forEach.call(ownKeys(O), function(key){
        defineProperty(result, key, descriptor(0, getOwnDescriptor(O, key)));
      });
      return result;
    },
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values:  createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7.abstract-refs                                                 *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : js.array.statics                                                  *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});

/******************************************************************************
 * Module : web.dom.itarable                                                  *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), true);
},{}],3:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg < finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
Abstract Base helper class
*/

var BaseHelper = (function (_THREE$Object3D) {
	function BaseHelper(options) {
		_classCallCheck(this, BaseHelper);

		var DEFAULTS = {
			name: "" };

		_get(Object.getPrototypeOf(BaseHelper.prototype), "constructor", this).call(this);
	}

	_inherits(BaseHelper, _THREE$Object3D);

	_prototypeProperties(BaseHelper, null, {
		setAsSelectionRoot: {
			value: function setAsSelectionRoot(flag) {
				this.traverse(function (child) {
					child.selectable = !flag;
					child.selectTrickleUp = flag;
				});
				this.selectable = flag;
				this.selectTrickleUp = !flag;
			},
			writable: true,
			configurable: true
		},
		hide: {
			value: function hide() {
				this.traverse(function (child) {
					child.visible = false;
				});
			},
			writable: true,
			configurable: true
		},
		show: {
			value: function show() {
				this.traverse(function (child) {
					child.visible = true;
				});
			},
			writable: true,
			configurable: true
		},
		setOpacity: {
			value: function setOpacity(opacityPercent) {
				this.traverse(function (child) {
					if (child.material) {
						child.material.opacity = child.material.opacity * opacityPercent;
						if (child.material.opacity < 1) {
							child.material.transparent = true;
						}
						//console.log("applying opacity to ",child);
					} else {}
				});
			},
			writable: true,
			configurable: true
		},
		highlight: {
			value: function highlight(flag) {
				this.traverse(function (child) {
					if (child.material && child.material.highlight) {
						child.material.highlight(flag);
					}
				});
			},
			writable: true,
			configurable: true
		},
		highlight2: {
			value: function highlight2(item) {
				this.traverse(function (child) {
					if (child.material && child.material.highlight) {
						if (child === item) {
							child.material.highlight(true);
							return;
						} else {
							child.material.highlight(false);
						}
					}
				});
			},
			writable: true,
			configurable: true
		}
	});

	return BaseHelper;
})(THREE.Object3D);

module.exports = BaseHelper;

//console.log("not applying opacity to",child);

},{}],6:[function(require,module,exports){
"use strict";

var BaseHelper = require("./BaseHelper");

var _require = require("./GizmoMaterial");

var GizmoMaterial = _require.GizmoMaterial;
var GizmoLineMaterial = _require.GizmoLineMaterial;

/*
//TODO: make this into a mesh / geometry subclass
*/
var CircleHelper = function CircleHelper(options) {
  BaseHelper.call(this);

  var options = options || {};

  var position = options.position || new THREE.Vector3();

  var direction = this.direction = options.direction || new THREE.Vector3();
  this.color = options.color !== undefined ? options.color : "#000";
  this.radius = options.radius !== undefined ? options.radius : 10;

  var defaultMaterial = new GizmoLineMaterial({ color: this.color,
    depthTest: false, depthWrite: false, renderDepth: 100000000000000000000 });
  this.material = options.material !== undefined ? options.material : defaultMaterial;

  this.setRadius(this.radius);
};

CircleHelper.prototype = Object.create(BaseHelper.prototype);
CircleHelper.prototype.constructor = CircleHelper;

CircleHelper.prototype.setRadius = function (radius) {

  var circleRadius = this.radius = radius;;
  var circleShape = new THREE.Shape();
  circleShape.moveTo(0, 0);
  circleShape.absarc(0, 0, circleRadius, 0, Math.PI * 2, false);
  var points = circleShape.createSpacedPointsGeometry(100);

  if (this.rCircle) this.remove(this.rCircle);

  this.rCircle = new THREE.Line(points, this.material);
  this.add(this.rCircle);
};

module.exports = CircleHelper;

},{"./BaseHelper":5,"./GizmoMaterial":8}],7:[function(require,module,exports){
"use strict";

var BaseHelper = require("./BaseHelper");

var _require = require("./GizmoMaterial");

var GizmoMaterial = _require.GizmoMaterial;
var GizmoLineMaterial = _require.GizmoLineMaterial;

/*
 id: inner diameter : blank space at center of cross
*/
var CrossHelper = function CrossHelper(options) {
  BaseHelper.call(this);
  var options = options || {};
  //var position = options.position || new THREE.Vector3();
  //var direction = this.direction = options.direction || new THREE.Vector3();

  var size = options.size !== undefined ? options.size : 10;
  this.color = options.color !== undefined ? options.color : "#0F0";

  var opacity = this.opacity = options.opacity || 0.8;
  var id = this.innerDia = options.id || 0;

  var offsetPos = size / 2 + id / 2;
  //starting point cross
  var startCrossGeometry = new THREE.Geometry();
  startCrossGeometry.vertices.push(new THREE.Vector3(0, -offsetPos, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(0, -id / 2, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(0, offsetPos, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(0, id / 2, 0));

  startCrossGeometry.vertices.push(new THREE.Vector3(-offsetPos, 0, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(-id / 2, 0, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(offsetPos, 0, 0));
  startCrossGeometry.vertices.push(new THREE.Vector3(id / 2, 0, 0));

  this.centerCross = new THREE.Line(startCrossGeometry, new GizmoLineMaterial({ color: this.color, opacity: opacity, transparent: true }), THREE.LinePieces);
  this.centerCross.material.depthTest = true;
  this.centerCross.material.depthWrite = true;
  this.centerCross.material.renderDepth = 100000000000000000000;

  this.add(this.centerCross);
  //this.position.copy( position );
};

CrossHelper.prototype = Object.create(BaseHelper.prototype);
CrossHelper.prototype.constructor = CrossHelper;

module.exports = CrossHelper;

},{"./BaseHelper":5,"./GizmoMaterial":8}],8:[function(require,module,exports){
"use strict";

GizmoMaterial = function (parameters) {
		THREE.MeshBasicMaterial.call(this);
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues(parameters);

		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : 16776960;

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function (highlighted) {

				if (highlighted) {

						this.color.set(this.highlightColor); //.setRGB( 1, 1, 0 );
						//this.opacity = 1;
				} else {

						this.color.copy(this.oldColor);
						//this.opacity = this.oldOpacity;
				}
		};
};

GizmoMaterial.prototype = Object.create(THREE.MeshBasicMaterial.prototype);

var GizmoLineMaterial = function GizmoLineMaterial(parameters) {
		THREE.LineBasicMaterial.call(this);
		//this.depthTest = false;
		//this.depthWrite = false;
		this.side = THREE.DoubleSide;
		//this.transparent = true;
		//this.opacity = 0.8;
		this.setValues(parameters);

		this.highlightColor = parameters.highlightColor !== undefined ? options.parameters : "#ffd200";

		this.oldColor = this.color.clone();
		//this.oldOpacity = this.opacity;

		this.highlight = function (highlighted) {

				if (highlighted) {

						this.color.set(this.highlightColor); //.setRGB( 1, 1, 0 );
						//this.opacity = 1;
				} else {

						this.color.copy(this.oldColor);
						//this.opacity = this.oldOpacity;
				}
		};
};

GizmoLineMaterial.prototype = Object.create(THREE.LineBasicMaterial.prototype);

module.exports = { GizmoMaterial: GizmoMaterial, GizmoLineMaterial: GizmoLineMaterial };

},{}],9:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseHelper = require("./BaseHelper");

var LabelHelper = (function (BaseHelper) {
  function LabelHelper(options) {
    _classCallCheck(this, LabelHelper);

    var DEFAULTS = {
      text: "",
      color: "rgba(0, 0, 0, 1)",
      bgColor: "rgba(255, 255, 255, 1)",
      background: true,
      fontSize: 10,
      fontFace: "Jura",
      fontWeight: "bold",
      fontStyle: "",

      borderSize: 0,
      alphaTest: 0.1,
      upscale: 10, //texture upscaling ratio
      baseRatio: 4 };

    var options = Object.assign({}, DEFAULTS, options);

    _get(Object.getPrototypeOf(LabelHelper.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);

    this.width = 0;
    this.height = 0;

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.width = 256;
    this.canvas.height = 256;

    this.context = this.canvas.getContext("2d");
    var texture = new THREE.Texture(this.canvas);
    this.texture = texture;

    this.measureText();
    this.drawText();
  }

  _inherits(LabelHelper, BaseHelper);

  _prototypeProperties(LabelHelper, null, {
    clear: {
      value: function clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._texture.needsUpdate = true;
      },
      writable: true,
      configurable: true
    },
    setText: {
      value: function setText(text) {
        this.text = text;

        this.measureText();
        this.drawText();
        this.generate();
      },
      writable: true,
      configurable: true
    },
    applyFontStyleToContext: {
      value: function applyFontStyleToContext(measureMode) {
        var measureMode = measureMode !== undefined ? measureMode : true;

        var fontSize = this.charHeight;
        if (!measureMode) fontSize = this.scaledFontSize;

        var font = this.fontWeight + " " + this.fontStyle + " " + fontSize + "px " + this.fontFace;

        this.context.font = font;
        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
      },
      writable: true,
      configurable: true
    },
    measureText: {
      value: function measureText(text) {
        var pixelRatio = window.devicePixelRatio || 1;
        var charWidth = 0;
        var charHeight = pixelRatio * this.fontSize;

        var canvas = this.canvas;
        var context = this.context;
        var fontFace = this.fontFace;
        var fontWeight = this.fontWeight;
        var fontStyle = this.fontStyle;
        var borderSize = this.borderSize;

        this.applyFontStyleToContext();

        function getPowerOfTwo(value, pow) {
          var pow = pow || 1;
          while (pow < value) {
            pow *= 2;
          }
          return pow;
        }

        //FIXME: hackery based on measurement of specific characters
        charWidth = context.measureText(Array(100 + 1).join("M")).width / 100;
        this.charWidth = charWidth;
        this.charHeight = charHeight;

        var charWidth = context.measureText(Array(100 + 1).join("M")).width / 100;
        var charHeight = this.fontSize;

        var rWidth = charWidth * (this.text.length - 1);
        var rHeight = charHeight;
        var textWidth = context.measureText(text).width;
        var sqrWidth = getPowerOfTwo(textWidth);
        var sqrHeight = getPowerOfTwo(2 * this.fontSize);

        var upscale = this.upscale;
        var baseRatio = this.baseRatio;

        sqrWidth *= upscale;
        sqrHeight *= upscale;

        this.canvasWidth = sqrWidth;
        this.canvasHeight = sqrHeight;

        this.width = sqrWidth / (upscale * baseRatio);
        this.height = sqrHeight / (upscale * baseRatio);

        this.scaledFontSize = this.fontSize * upscale;

        this.textWidth = textWidth * upscale / (upscale * baseRatio);
        this.textHeight = rHeight * upscale / (upscale * baseRatio);

        //console.log("canvas",sqrWidth, sqrHeight,"Width/height",this.width,this.height,"text (glSizes)",this.textWidth,this.textHeight);
      },
      writable: true,
      configurable: true
    },
    drawText: {
      value: function drawText() {
        var canvas = this.canvas;
        var context = this.context;
        var text = this.text;

        var color = this.color;

        var fontWeight = this.fontWeight;
        var fontStyle = this.fontStyle;
        var fontFace = this.fontFace;
        var charHeight = this.charHeight;

        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        this.applyFontStyleToContext(false);

        context.clearRect(0, 0, canvas.width, canvas.height);

        //context.fillStyle = "#000000";
        //context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "#ffffff";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        //textWidth
        //ctx.strokeStyle="red";
        //ctx.rect((canvas.width-rWidth)/2,(canvas.height-rHeight)/2,rWidth,rHeight);
        //ctx.stroke();

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.generateMipmaps = true;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        this._texture = texture;
      },
      writable: true,
      configurable: true
    }
  });

  return LabelHelper;
})(BaseHelper);

/*Perspective 3d helpers*/

var LabelHelper3d = (function (LabelHelper) {
  function LabelHelper3d(options) {
    _classCallCheck(this, LabelHelper3d);

    var DEFAULTS = {};

    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(LabelHelper3d.prototype), "constructor", this).call(this, options);
    Object.assign(this, options);

    this.generate();
  }

  _inherits(LabelHelper3d, LabelHelper);

  _prototypeProperties(LabelHelper3d, null, {
    generate: {
      value: function generate() {
        var spriteMaterial = new THREE.SpriteMaterial({
          map: this._texture,
          transparent: true,
          alphaTest: this.alphaTest,
          useScreenCoordinates: false,
          scaleByViewport: false,
          color: this.color,
          side: THREE.DoubleSide });

        var width = this.width;
        var height = this.height;

        var textSprite = new THREE.Sprite(spriteMaterial);
        textSprite.scale.set(width, height, 1);

        this.textSprite = textSprite;
        this.add(textSprite);
      },
      writable: true,
      configurable: true
    }
  });

  return LabelHelper3d;
})(LabelHelper);

/*Flat (perspective not front facing) helper*/

var LabelHelperPlane = (function (LabelHelper) {
  function LabelHelperPlane(options) {
    _classCallCheck(this, LabelHelperPlane);

    var DEFAULTS = {};
    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(LabelHelperPlane.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);
    this.generate();
  }

  _inherits(LabelHelperPlane, LabelHelper);

  _prototypeProperties(LabelHelperPlane, null, {
    generate: {
      value: function generate() {
        var width = this.width;
        var height = this.height;
        //console.log("width", width,"height", height);

        var material = new GizmoMaterial({
          map: this._texture,
          transparent: true,
          color: this.color,
          alphaTest: this.alphaTest,
          side: THREE.FrontSide,
          shading: THREE.FlatShading });

        /*depthTest:false,
         depthWrite:false,
         renderDepth : 1e20,*/

        var textPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);

        if (this.textMesh) this.remove(this.textMesh);

        this.textMesh = textPlane;
        this.add(textPlane);

        if (this.textPlaneBack) this.remove(this.textPlaneBack);

        this.textPlaneBack = textPlane.clone();
        this.textPlaneBack.rotation.y = -Math.PI;
        this.add(this.textPlaneBack);
      },
      writable: true,
      configurable: true
    }
  });

  return LabelHelperPlane;
})(LabelHelper);

module.exports = { LabelHelperPlane: LabelHelperPlane, LabelHelper3d: LabelHelper3d };
//convertion of canvas to webglUnits

//depthTest:false,
//depthWrite:false,
//renderDepth : 1e20

},{"./BaseHelper":5}],10:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseHelper = require("./BaseHelper");

var _require = require("./GizmoMaterial");

var GizmoMaterial = _require.GizmoMaterial;
var GizmoLineMaterial = _require.GizmoLineMaterial;

//TODO:should inherit from THREE.MESH, but some weird stuff going on

var LineHelper = (function (BaseHelper) {
  function LineHelper(options) {
    _classCallCheck(this, LineHelper);

    var DEFAULTS = {
      start: new THREE.Vector3(),
      end: new THREE.Vector3(),
      length: 0,
      color: "#000" };

    var options = Object.assign({}, DEFAULTS, options);

    Object.assign(this, options);

    _get(Object.getPrototypeOf(LineHelper.prototype), "constructor", this).call(this, options);

    this.material = new GizmoLineMaterial({ color: this.color, opacity: 0.4, transparent: true });
    this._updateGeometry();
    //super( this._geometry, this._material );
  }

  _inherits(LineHelper, BaseHelper);

  _prototypeProperties(LineHelper, null, {
    _makeGeometry: {
      value: function _makeGeometry() {
        if (!this.start || !this.end) {
          return;
        }this._geometry = new THREE.Geometry();

        this._geometry.vertices.push(this.start);
        this._geometry.vertices.push(this.end);
        /**/
      },
      writable: true,
      configurable: true
    },
    _updateGeometry: {
      value: function _updateGeometry() {
        /*this.geometry.dynamic = true;
        this.geometry.vertices[0] = this.start ;
        this.geometry.vertices[1] = this.end ;
        this.geometry.verticesNeedUpdate = true;*/

        if (!this.start || !this.end) {
          return;
        }var geometry = new THREE.Geometry();

        geometry.vertices.push(this.start);
        geometry.vertices.push(this.end);

        if (this.line) this.remove(this.line);
        this.line = new THREE.Line(geometry, this.material);
        this.add(this.line);
      },
      writable: true,
      configurable: true
    },
    setStart: {
      value: function setStart(start) {
        this.start = start || new THREE.Vector3();
        this._updateGeometry();
      },
      writable: true,
      configurable: true
    },
    setEnd: {
      value: function setEnd(end) {
        this.end = end || new THREE.Vector3();
        this._updateGeometry();
      },
      writable: true,
      configurable: true
    },
    setLength: {
      value: function setLength(length) {
        this.length = length || 0;
        this.end = this.end.clone().sub(this.start).setLength(this.length);
        this._updateGeometry();
      },
      writable: true,
      configurable: true
    }
  });

  return LineHelper;
})(BaseHelper);

module.exports = LineHelper;

},{"./BaseHelper":5,"./GizmoMaterial":8}],11:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseHelper = require("../BaseHelper");

/*
Base helper for all annotations
*/

var AnnotationHelper = (function (BaseHelper) {
  function AnnotationHelper(options) {
    _classCallCheck(this, AnnotationHelper);

    var DEFAULTS = {
      name: "",
      drawArrows: true,
      drawLeftArrow: true,
      drawRightArrow: true,
      arrowColor: "000",
      arrowsPlacement: "dynamic", //can be either, dynamic, inside, outside
      arrowHeadSize: 2,
      arrowHeadWidth: 0.8,

      lineWidth: 1,
      drawSideLines: true,
      sideLength: 0,
      sideLengthExtra: 2, //how much sidelines should stick out
      sideLineColor: "000",
      sideLineSide: "front",

      drawLabel: true,
      labelPos: "center",
      labelType: "flat", //frontFacing or flat
      fontSize: 10,
      fontFace: "Jura",
      textColor: "#000",
      textBgColor: null,
      lengthAsLabel: true, //TODO: "length is too specific change that"
      textPrefix: "" };

    //TODO: how to deal with lineWidth would require not using simple lines but strips
    //see ANGLE issue on windows platforms

    var options = Object.assign({}, DEFAULTS, options);

    _get(Object.getPrototypeOf(AnnotationHelper.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);

    /*this would be practical for "human referencing": ie
    for example "front mount hole" for a given measurement etc
    should name uniqueness be enforced ? yes, makes sense!
    */
    //this.name = "";

    //can this object be translated/rotated/scaled on its own ? NOPE
    this.transformable = false;
  }

  _inherits(AnnotationHelper, BaseHelper);

  _prototypeProperties(AnnotationHelper, null, {
    getTargetBoundsData: {

      /*
        get info about target object
      */

      value: function getTargetBoundsData(target, intersection) {
        /* -1 /+1 directions on all 3 axis to determine for exampel WHERE an annotation
        should be placed (left/right, front/back, top/bottom)
        */
        var putSide = [0, 0, 0];
        //target.

        return { putSide: putSide };
      },
      writable: true,
      configurable: true
    }
  });

  return AnnotationHelper;
})(BaseHelper);

module.exports = AnnotationHelper;
//TODO: perhas a "textformat method would be better ??

},{"../BaseHelper":5}],12:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _require = require("../GizmoMaterial");

var GizmoMaterial = _require.GizmoMaterial;
var GizmoLineMaterial = _require.GizmoLineMaterial;

var CrossHelper = require("../CrossHelper");
var CircleHelper = require("../CircleHelper");
var AnnotationHelper = require("./AnnotationHelper");

var LeaderLineHelper = require("../dimensions/LeaderLineHelper");
var SizeHelper = require("../dimensions/SizeHelper");

/*
  Helper to measure ... diameters
  
  Two step interactive version : 
    - place center
    - place diameter
*/

var DiameterHelper = (function (AnnotationHelper) {
  function DiameterHelper(options) {
    _classCallCheck(this, DiameterHelper);

    var DEFAULTS = {
      diameter: 10,
      _position: new THREE.Vector3(),
      orientation: new THREE.Vector3(),
      centerColor: "#F00",
      crossColor: "#F00" };

    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(DiameterHelper.prototype), "constructor", this).call(this, options);

    this.text = options.text !== undefined ? options.text : this.diameter.toFixed(2);
    //FIXME: hack
    this.textColor = "#ff0077";
    this.arrowColor = this.textColor;
    this.centerColor = this.textColor;
    this.crossColor = this.textColor;
    this.textBgColor = "rgba(255, 255, 255, 0)";

    //FIXME: this needs to be in all of the numerical measurement or not ?
    this.tolerance = options.tolerance !== undefined ? options.tolerance : 0;

    this.lineMaterial = new GizmoLineMaterial({ color: this.centerColor, linewidth: 2 });
    //depthTest:false, depthWrite:false,renderDepth : 1e20

    this.dimDisplayType = options.dimDisplayType !== undefined ? options.dimDisplayType : "offsetLine";
    this.centerCrossSize = 1.5;

    this.center = undefined;
    this.object = undefined;
    this.pointA = undefined;
    this.pointB = undefined;
    this.pointC = undefined;

    //initialise internal sub objects
    this.centerCross = new CrossHelper({ size: this.centerCrossSize, color: this.centerColor });
    this.centerCross.hide();
    this.add(this.centerCross);

    //pointA cross
    this.pointACross = new CrossHelper({ size: this.centerCrossSize, color: this.crossColor });
    this.pointACross.hide();
    this.add(this.pointACross);

    //pointB cross
    this.pointBCross = new CrossHelper({ size: this.centerCrossSize, color: this.crossColor });
    this.pointBCross.hide();
    this.add(this.pointBCross);

    //pointC cross
    this.pointCCross = new CrossHelper({ size: this.centerCrossSize, color: this.crossColor });
    this.pointCCross.hide();
    this.add(this.pointCCross);

    this.diaCircle = new CircleHelper({ material: this.lineMaterial });
    this.diaCircle.hide();
    this.add(this.diaCircle);

    /*this.sizeArrow = new SizeHelper({
    fontSize: this.fontSize,
    textColor: this.textColor, textBgColor:this.textBgColor, labelType:this.labelType,
    arrowColor:this.textColor, 
    sideLineColor:this.textColor,
    textPrefix:"∅ ",
    });
    this.sizeArrow.hide();
    this.add( this.sizeArrow );*/

    //TODO: add settable swtich between size helper & leader line
    //leader line

    //var text = this.text;
    var text = this.tolerance === 0 ? this.text : this.text + "±" + this.tolerance;
    //text:"∅"+this.text+"±0.15"

    this.leaderLine = new LeaderLineHelper({ text: text, radius: this.diameter / 2,
      fontSize: this.fontSize,
      textColor: this.textColor,
      textBgColor: this.textBgColor,
      labelType: this.labelType,
      arrowColor: this.textColor,
      linesColor: this.textColor
    });
    this.leaderLine.hide();
    this.add(this.leaderLine);

    if (options.center) this.setCenter(options.center);
    if (options.diameter) this.setDiameter(options.diameter);
    if (options.orientation) this.setOrientation(options.orientation);

    this.setAsSelectionRoot(true);
    //FIXME: do this in a more coherent way
    this._setName();
  }

  _inherits(DiameterHelper, AnnotationHelper);

  _prototypeProperties(DiameterHelper, null, {
    set: {
      value: function set() {
        this.setCenter();
        this.setDiameter();
      },
      writable: true,
      configurable: true
    },
    unset: {
      value: function unset() {

        this.centerCross.hide();
        this.pointACross.hide();
        this.pointBCross.hide();
        this.pointCCross.hide();

        //this.sizeArrow.hide();
        this.leaderLine.hide();

        this.diaCircle.hide();

        this.position.copy(new THREE.Vector3());
        this.setOrientation(new THREE.Vector3(0, 0, 1));
      },
      writable: true,
      configurable: true
    },
    setCenter: {
      value: function setCenter(center, object) {
        if (center) this.position.copy(center);
        if (center) this.center = center;
        if (object) this.object = object;

        this.centerCross.show();
        //FIXME: only needed if we do not offset this whole helper for positioning on the diam
        //this.centerCross.position.copy( this.center );
      },
      writable: true,
      configurable: true
    },
    setPointA: {

      //for 3 point variant

      value: function setPointA(pointA, object) {
        if (pointA) this.pointA = pointA;
        this.object = object;
        this.pointACross.position.copy(pointA);
        this.pointACross.show();
      },
      writable: true,
      configurable: true
    },
    setPointB: {
      value: function setPointB(pointB, object) {
        if (pointB) this.pointB = pointB;
        this.object = object;
        this.pointBCross.position.copy(pointB);
        this.pointBCross.show();
      },
      writable: true,
      configurable: true
    },
    setPointC: {
      value: function setPointC(pointC, object) {
        if (pointC) this.pointC = pointC;
        this.object = object;
        this.pointCCross.position.copy(pointC);
        this.pointCCross.show();

        this.setDataFromThreePoints();
      },
      writable: true,
      configurable: true
    },
    setDiameter: {
      value: function setDiameter(diameter) {
        if (!diameter && !this.diameter) {
          return;
        }
        this.diameter = diameter;
        this.text = this.diameter.toFixed(2);

        //this.sizeArrow.setLength( this.diameter );
        //this.sizeArrow.setSideLength( this.diameter/2+10 );

        this.diaCircle.setRadius(this.diameter / 2);

        //this.sizeArrow.show();
        this.leaderLine.show();

        this.diaCircle.show();
      },
      writable: true,
      configurable: true
    },
    setRadius: {
      value: function setRadius(radius) {
        if (!radius && !this.diameter) {
          return;
        }
        this.setDiameter(radius * 2);
      },
      writable: true,
      configurable: true
    },
    setRadiusPoint: {

      /*Sets the radius/diameter from one 3d point
      */

      value: function setRadiusPoint(point, normal) {
        var radius = point.clone().sub(this.position).length();
        this.setDiameter(radius * 2);
      },
      writable: true,
      configurable: true
    },
    setDataFromThreePoints: {

      //compute center , dia/radius from three 3d points

      value: function setDataFromThreePoints() {
        var plane = new THREE.Plane().setFromCoplanarPoints(this.pointA, this.pointB, this.pointC);

        var center = new THREE.Vector3();
        var pointA = this.pointA;
        var pointB = this.pointB;
        var pointC = this.pointC;

        //see http://en.wikipedia.org/wiki/Circumscribed_circle
        // triangle "edges"
        var t = pointA.clone().sub(pointB);
        var u = pointB.clone().sub(pointC);
        var v = pointC.clone().sub(pointA);
        var m = pointA.clone().sub(pointC);
        var x = pointB.clone().sub(pointA);
        var z = pointC.clone().sub(pointB);

        var foo = t.clone().cross(u).length();
        var bar = 2 * foo;
        var baz = foo * foo;
        var buu = 2 * baz;

        var radius = t.length() * u.length() * v.length() / bar;
        //console.log("radius",radius);

        var alpha = u.lengthSq() * t.clone().dot(m) / buu;
        var beta = m.lengthSq() * x.clone().dot(u) / buu;
        var gamma = t.lengthSq() * v.clone().dot(z) / buu;

        var center = pointA.clone().multiplyScalar(alpha).add(pointB.clone().multiplyScalar(beta)).add(pointC.clone().multiplyScalar(gamma));
        //console.log("center", center);

        this.setOrientation(plane.normal);
        this.setCenter(center);
        this.setRadius(radius);

        this.pointACross.position.copy(this.pointA.clone().sub(this.position));
        this.pointBCross.position.copy(this.pointB.clone().sub(this.position));
        this.pointCCross.position.copy(this.pointC.clone().sub(this.position));

        /*(x1-center.x)^2 + (y1-center.y)^2 = r^2
        (x2-center.x)^2 + (y2-center.y)^2 = r^2
        (x3-center.x)^2 + (y3-center.y)^2 = r^2*/

        //for a Circle of radius r , center C=(Cx,cy,cz) , and normal vector n (X is the cross product).

        //Here, u is any unit vector perpendicular to n. Since there are an infinite number of
        //vectors perpendicular to n, using a parametrized n is helpful. If the orientation is specified by a zenith angle  and azimuth , then , , and  can have simple forms:
        //P(t) = r*cos(t)*u + r*sin(t)*n X u+ C;
        //see here for more infos :http://mathematica.stackexchange.com/questions/16209/how-to-determine-the-center-and-radius-of-a-circle-given-three-points-in-3d

        /*v1 = p2 - p1;
         v2 = p3 - p1;
         {v1, v2} = Orthogonalize[{v1, v2}];
         n = Cross[v1, v2];
         eqs = {
          (x - x1)^2 + (y - y1)^2 + (z - z1)^2 == r^2,
          (x - x2)^2 + (y - y2)^2 + (z - z2)^2 == r^2,
          (x - x3)^2 + (y - y3)^2 + (z - z3)^2 == r^2,
          n.({x, y, z} - p1) == 0
         };
         */
        //P: center
        //all points are on the circle
        //var PA = PB = PC;

        /*var v1 = pointB.clone().sub( pointA );
        var v2 = pointC.clone().sub( pointA );
        var n = new THREE.Vector3().crossVectors( v1, v2 );
        
        var PA = (x - x1)^2 + (y - y1)^2 + (z - z1)^2 == r^2,
        var PB = (x - x2)^2 + (y - y2)^2 + (z - z2)^2 == r^2,
        var PC = (x - x3)^2 + (y - y3)^2 + (z - z3)^2 == r^2,
        //var eq4 = n.({x, y, z} - p1) == 0;*/

        // triangle "edges"
        /*var t = pointB.clone().sub( pointA );
        var u = pointC.clone().sub( pointA );
        var v = pointC.clone().sub( pointB );
        
        // triangle normal
        var w = new THREE.Vector3().crossVectors( t, u );
        var wsl = w.lengthSq();
         return;
        if (wsl<10e-14) return false; // area of the triangle is too small (you may additionally check the points for colinearity if you are paranoid)
         // helpers
        var iwsl2 = 1.0 / (2.0*wsl);
        var tt = t.clone().dot( t );//new THREE.Vector3().multiplyVectors(t,t);
        var uu = u.clone().dot( u );//new THREE.Vector3().multiplyVectors(u,u);
        var vv = v.clone().dot( v );
        var uv = new THREE.Vector3().multiplyVectors(u,v);
        var tv = new THREE.Vector3().multiplyVectors(t,v);
        
         // result circle
        Vector3d circCenter = p1 + (u*tt*(u*v) - t*uu*(t*v)) * iwsl2;
        //double   circRadius = sqrt(tt * uu * (v*v) * iwsl2*0.5);
        //Vector3d circAxis   = w / sqrt(wsl);
        
        
        var circCenter =  pointA.clone.add(  u.clone().multiply( tt ).multiply( uv ).sub( t.clone().multiply( uu ).multiply( tv ) ) ).multiplyScalar( iwsl2);
        this.setCenter( circCenter );
        
        var circRadius = Math.sqrt( tt*uu*vv * iwsl2*0.5);
        var circAxis   = w.divideScalar( Math.sqrt(wsl) );*/
      },
      writable: true,
      configurable: true
    },
    setOrientation: {
      value: function setOrientation(orientation) {
        this.orientation = orientation;
        //console.log("this.orientation",this.orientation);

        var defaultOrientation = new THREE.Vector3(0, 0, 1);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(defaultOrientation, this.orientation.clone());
        this.rotation.setFromQuaternion(quaternion);
      },
      writable: true,
      configurable: true
    },
    _setName: {
      value: function _setName() {
        var tmpValue = this.diameter;
        if (tmpValue) tmpValue = tmpValue.toFixed(2);
        this.name = "Diameter: " + tmpValue;
      },
      writable: true,
      configurable: true
    }
  });

  return DiameterHelper;
})(AnnotationHelper);

module.exports = DiameterHelper;

},{"../CircleHelper":6,"../CrossHelper":7,"../GizmoMaterial":8,"../dimensions/LeaderLineHelper":17,"../dimensions/SizeHelper":18,"./AnnotationHelper":11}],13:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");
var CrossHelper = require("../CrossHelper");

var DistanceHelper = (function (AnnotationHelper) {
  function DistanceHelper(options) {
    _classCallCheck(this, DistanceHelper);

    var DEFAULTS = {
      crossSize: 3,
      crossColor: "#000"
    };

    var options = Object.assign({}, DEFAULTS, options);

    _get(Object.getPrototypeOf(DistanceHelper.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);

    //this.arrowHeadSize   = 4;
    this.start = undefined;
    this.startObject = options.startObject !== undefined ? options.startObject : undefined;
    this.end = undefined;
    this.endObject = options.endObject !== undefined ? options.endObject : undefined;

    this.distance = undefined;

    //initialise internal sub objects
    this.startCross = new CrossHelper({ size: this.crossSize, color: this.crossColor });
    this.startCross.hide();
    this.add(this.startCross);

    //FIXME: side of sideLineSide needs to be dynamic

    this.sizeArrow = new SizeHelper({
      fontSize: this.fontSize,
      arrowColor: this.arrowColor,
      sideLineColor: this.textColor,
      textBgColor: this.textBgColor, textColor: this.textColor, labelType: this.labelType, sideLength: 6, sideLineSide: "back" });

    this.sizeArrow.hide();
    this.add(this.sizeArrow);

    if (options.start) this.setStart(options.start, this.startObject);
    if (options.end) this.setEnd(options.end, this.endObject);

    this.updatable = false;

    this.setAsSelectionRoot(true);
    //FIXME: do this in a more coherent way
    this._setName();
  }

  _inherits(DistanceHelper, AnnotationHelper);

  _prototypeProperties(DistanceHelper, null, {
    setStart: {

      /*start: vector3D
      object: optional : on which object is the start point
      */

      value: function setStart(start, object) {
        if (!start) {
          return;
        }this.start = start;
        if (object) this.startObject = object;
        var object = this.startObject;
        //console.log("setting start",start, object, object.worldToLocal(start.clone()) );

        //FIXME: experimental
        this.curStartObjectPos = object.position.clone();

        this._startOffset = start.clone().sub(this.curStartObjectPos);
        if (!this._startHook) {
          this._startHook = new THREE.Object3D();
          this._startHook.position.copy(this.start.clone().sub(object.position)); //object.worldToLocal(this.start) );
          object.add(this._startHook);
        }

        this.startCross.show();
        this.startCross.position.copy(this.start);

        this.sizeArrow.setStart(this.start);
      },
      writable: true,
      configurable: true
    },
    setEnd: {
      value: function setEnd(end, object) {
        if (!end) {
          return;
        }this.end = end;
        if (object) this.endObject = object;

        var object = this.endObject;

        //FIXME: experimental
        this.curEndObjectPos = object.position.clone();

        this._endOffset = end.clone().sub(this.curEndObjectPos);

        if (!this._endHook) {
          this._endHook = new THREE.Object3D();
          this._endHook.position.copy(this.end.clone().sub(object.position)); //object.worldToLocal(this.end) );
          object.add(this._endHook);
        }

        this.distance = end.clone().sub(this.start).length();

        this.sizeArrow.setEnd(this.end);
        this.sizeArrow.show();

        //this.sizeArrow.label.textMesh.material.opacity = 0.1;
      },
      writable: true,
      configurable: true
    },
    unset: {
      value: function unset() {
        this.startCross.hide();
        this.sizeArrow.hide();

        this._endHook = null;
        this._startHook = null;
      },
      writable: true,
      configurable: true
    },
    update: {
      value: function update() {
        return;
        //TODO: find a way to only call this when needed
        if (!this.visible) {
          return;
        }if (!this.updatable) {
          return;
        }var changed = false;

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

        this.setStart(this.startObject.localToWorld(this._startHook.position.clone()));
        this.setEnd(this.endObject.localToWorld(this._endHook.position.clone()));

        this._setName();
      },
      writable: true,
      configurable: true
    },
    _setName: {
      value: function _setName() {
        var tmpValue = this.distance;
        if (tmpValue) tmpValue = tmpValue.toFixed(2);
        this.name = "Distance: " + tmpValue;
      },
      writable: true,
      configurable: true
    }
  });

  return DistanceHelper;
})(AnnotationHelper);

module.exports = DistanceHelper;

},{"../CrossHelper":7,"../dimensions/SizeHelper":18,"./AnnotationHelper":11}],14:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var AnnotationHelper = require("./AnnotationHelper");
var CrossHelper = require("../CrossHelper");

/*
  Helper for basic notes (single point)
*/

var NoteHelper = (function (AnnotationHelper) {
  function NoteHelper(options) {
    _classCallCheck(this, NoteHelper);

    var DEFAULTS = {
      crossColor: "#F00",
      text: "",
      title: "" };

    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(NoteHelper.prototype), "constructor", this).call(this, options);

    //initialise internal sub objects
    this.pointCross = new CrossHelper({ size: 2.5, color: this.crossColor });
    this.pointCross.hide();
    this.add(this.pointCross);

    this.point = options.point !== undefined ? options.point : undefined;
    this.object = options.object !== undefined ? options.object : undefined;

    if (options.point) this.setPoint(this.point, this.object);

    this.setAsSelectionRoot(true);
    //FIXME: do this in a more coherent way
    this._setName();
  }

  _inherits(NoteHelper, AnnotationHelper);

  _prototypeProperties(NoteHelper, null, {
    unset: {
      value: function unset() {
        this.pointCross.hide();
      },
      writable: true,
      configurable: true
    },
    setPoint: {
      value: function setPoint(point, object) {
        if (point) this.point = point;
        if (object) this.object = object;

        //point location cross
        this.pointCross.position.copy(this.point);
        this.pointCross.show();
      },
      writable: true,
      configurable: true
    },
    _setName: {
      value: function _setName() {
        this.name = "Note: " + this.title;
      },
      writable: true,
      configurable: true
    }
  });

  return NoteHelper;
})(AnnotationHelper);

module.exports = NoteHelper;

},{"../CrossHelper":7,"./AnnotationHelper":11}],15:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var AnnotationHelper = require("./AnnotationHelper");
var SizeHelper = require("../dimensions/SizeHelper");
var CrossHelper = require("../CrossHelper");

var ThicknessHelper = (function (AnnotationHelper) {
  function ThicknessHelper(options) {
    _classCallCheck(this, ThicknessHelper);

    var DEFAULTS = {
      normalType: "face", //can be, face, x,y,z
      sideLength: 10,
      debug: false,

      object: undefined,
      entryPoint: undefined,
      exitPoint: undefined,
      thickness: undefined };

    this.DEFAULTS = DEFAULTS;
    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(ThicknessHelper.prototype), "constructor", this).call(this, options);
    Object.assign(this, options); //unsure

    /*this.object     = undefined;
    this.entryPoint = undefined;
    this.exitPoint = undefined;
    this.normal     = undefined;*/

    //initialise internal sub objects
    this.thicknessHelperArrows = new SizeHelper({
      textColor: this.textColor,
      textBgColor: this.textBgColor,
      fontSize: this.fontSize,
      fontFace: this.fontFace,
      arrowsPlacement: "outside",
      labelType: "flat",
      sideLength: this.sideLength
    });
    this.thicknessHelperArrows.hide();
    this.add(this.thicknessHelperArrows);

    /*if( options.thickness )this.setThickness( options.thickness );
    if( options.point ) this.setPoint( options.point, options.object );
    if( options.normal )this.setNormal( options.normal );*/

    this.setAsSelectionRoot(true);
  }

  _inherits(ThicknessHelper, AnnotationHelper);

  _prototypeProperties(ThicknessHelper, null, {
    setThickness: {
      value: function setThickness(thickness) {
        this.thickness = thickness;
      },
      writable: true,
      configurable: true
    },
    setPoint: {
      value: function setPoint(point, object) {
        this.point = point;
        this.object = object;
      },
      writable: true,
      configurable: true
    },
    setNormal: {
      value: function setNormal(normal) {
        this.normal = normal;
        //this.escapePoint = this.point.clone().sub( normal.clone().normalize().multiplyScalar( this.thickness ));
        //this.done();  
      },
      writable: true,
      configurable: true
    },
    set: {
      value: function set(entryInteresect) //, selectedObject)
      {
        var normalType = this.normalType;
        var normal = entryInteresect.face.normal.clone();
        switch (normalType) {
          case "face":
            break;
          case "x":
            normal = new THREE.Vector3(1, 0, 0);
            break;
          case "y":
            normal = new THREE.Vector3(0, 1, 0);
            break;
          case "z":
            normal = new THREE.Vector3(0, 0, 1);
            break;
        }

        var object = entryInteresect.object;
        if (!object) {
          return;
        }var point = entryInteresect.point.clone();
        var flippedNormal = normal.clone().negate();
        var offsetPoint = point.clone().add(flippedNormal.clone().multiplyScalar(1000));

        //get escape point
        var raycaster = new THREE.Raycaster(offsetPoint, normal.clone().normalize());
        var intersects = raycaster.intersectObjects([object], true);

        var escapePoint = null;
        var minDist = Infinity;
        for (var i = 0; i < intersects.length; i++) {
          var curPt = intersects[i].point;
          var curLn = curPt.clone().sub(point).length();

          if (curLn < minDist) {
            escapePoint = curPt;
            minDist = curLn;
          }
        }
        //compute actual thickness
        var endToStart = escapePoint.clone().sub(point);
        this.thickness = endToStart.length();

        //set various internal attributes
        this.setPoint(point, object);
        this.setNormal(normal);
        //this._drawDebugHelpers( point, offsetPoint, escapePoint, normal, flippedNormal);
        //this.done();
        ////
        try {
          var midPoint = endToStart.divideScalar(2).add(point);
          console.log("midPoint", point, midPoint, escapePoint);
          var putSide = this.getTargetBoundsData(object, midPoint);
          //this.thicknessHelperArrows.setFacingSide( new THREE.Vector3().fromArray( putSide ) );
        } catch (error) {
          console.error(error);
        }
        /*
        this.thicknessHelperArrows.setFromParams( {
          start:point, end:escapePoint,putSide:putSide,
        //TODO:these are already specified in constructor, how to deal with it ?
          textColor:this.textColor, 
          textBgColor:this.textBgColor, 
          fontSize:this.fontSize,
          fontFace:this.fontFace,
          arrowsPlacement:"outside",
          labelType:"flat",
          sideLength:this.sideLength
        });*/
        this.thicknessHelperArrows.setStart(point);
        this.thicknessHelperArrows.setEnd(escapePoint);
        this.thicknessHelperArrows.setFacingSide(putSide);
        this.thicknessHelperArrows.show();
      },
      writable: true,
      configurable: true
    },
    unset: {
      value: function unset() {
        //this.thickness = undefined;
        var options = Object.assign({}, this.DEFAULTS, options);
        Object.assign(this, options); //unsure
        this.thicknessHelperArrows.hide();
      },
      writable: true,
      configurable: true
    },
    done: {

      //call this when everything has been set ?

      value: function done() {
        //this.thicknessHelperArrows.setStart( this.point );
        //this.thicknessHelperArrows.setEnd( this.escapePoint );
        this.thicknessHelperArrows.show();
      },
      writable: true,
      configurable: true
    },
    setFromParams: {

      /* call this to set all params all at once*/

      value: function setFromParams(params) {},
      writable: true,
      configurable: true
    },
    getTargetBoundsData: {

      //temporary
      /*
        get info about target object
      */

      value: function getTargetBoundsData(targetObject, point) {
        /* -1 /+1 directions on all 3 axis to determine for exampel WHERE an annotation
        should be placed (left/right, front/back, top/bottom)
        */
        var putSide = [0, 0, 0];
        if (!targetObject) {
          return putSide;
        }var bbox = targetObject.boundingBox;

        var objectCenter = new THREE.Vector3().addVectors(targetObject.boundingBox.min, targetObject.boundingBox.max).divideScalar(2);

        //let realCenter = point.clone().sub( objectCenter );
        //console.log("objectCenter",objectCenter,"point", point,foo.normalize());

        var axes = ["x", "y", "z"];
        axes.forEach(function (axis, index) {
          var axisOffset = point[axis] - objectCenter[axis];
          axisOffset = Math.round(axisOffset * 100) / 100;
          //console.log("axis",axis,axisOffset);
          if (axisOffset > 0) {
            //console.log(`in FRONT along ${axis}`);
            putSide[index] = 1;
          } else if (axisOffset < 0) {
            //console.log(`in BACK along ${axis}`);
            putSide[index] = -1;
          }
        });

        console.log("putSide", putSide);
        putSide = new THREE.Vector3().fromArray(putSide);
        return putSide;
      },
      writable: true,
      configurable: true
    },
    _drawVisuals: {
      value: function _drawVisuals() {
        this.faceNormalHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 15, 16711680);
        this.faceNormalHelper2 = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 15, 65280);
        var remotePointHelper = new CrossHelper({ color: 16711680 });
        var escapePointHelper = new CrossHelper({ color: 16711680 });

        //debug helpers
        this.debugHelpers = new BaseHelper();

        this.debugHelpers.add(faceNormalHelper);
        this.debugHelpers.add(faceNormalHelper2);
        this.debugHelpers.add(remotePointHelper);
        this.debugHelpers.add(escapePointHelper);
      },
      writable: true,
      configurable: true
    },
    _updateVisual: {
      value: function _updateVisual() {},
      writable: true,
      configurable: true
    },
    toJson: {
      value: function toJson() {},
      writable: true,
      configurable: true
    }
  });

  return ThicknessHelper;
})(AnnotationHelper);

module.exports = ThicknessHelper;

/*this.faceNormalHelper  = new THREE.ArrowHelper(normal, point, 15, 0XFF0000);
this.faceNormalHelper2 = new THREE.ArrowHelper(flippedNormal,point, 15, 0X00FF00);
var remotePointHelper = new CrossHelper({position:offsetPoint,color:0xFF0000});
var escapePointHelper = new CrossHelper({position:escapePoint,color:0xFF0000});*/

},{"../CrossHelper":7,"../dimensions/SizeHelper":18,"./AnnotationHelper":11}],16:[function(require,module,exports){
"use strict";

require("babel/polyfill");

exports.AnnotationHelper = require("./AnnotationHelper.js");
exports.DistanceHelper = require("./DistanceHelper.js");
exports.NoteHelper = require("./NoteHelper.js");
exports.DiameterHelper = require("./DiameterHelper.js");
//exports.AngDimHelper     = require("./AngDimHelper.js" );
exports.ThicknessHelper = require("./ThicknessHelper.js");

//FIXME: temporary hack
window.AnnotationHelper = exports.AnnotationHelper;
window.DistanceHelper = exports.DistanceHelper;
window.DiameterHelper = exports.DiameterHelper;
window.NoteHelper = exports.NoteHelper;
window.ThicknessHelper = exports.ThicknessHelper;
//window.AngDimHelper      = exports.AngDimHelper;

},{"./AnnotationHelper.js":11,"./DiameterHelper.js":12,"./DistanceHelper.js":13,"./NoteHelper.js":14,"./ThicknessHelper.js":15,"babel/polyfill":4}],17:[function(require,module,exports){
"use strict";

var BaseHelper = require("../BaseHelper");
var CrossHelper = require("../CrossHelper");

var _require = require("../LabelHelper");

var LabelHelperPlane = _require.LabelHelperPlane;
var LabelHelper3d = _require.LabelHelper3d;

var _require2 = require("../GizmoMaterial");

var GizmoMaterial = _require2.GizmoMaterial;
var GizmoLineMaterial = _require2.GizmoLineMaterial;

/*

*/
var LeaderLineHelper = function LeaderLineHelper(options) {
  BaseHelper.call(this);
  var options = options || {};

  this.distance = options.distance || 30;
  this.color = options.color || "#000000";
  this.text = options.text !== undefined ? options.text : " ";

  this.arrowColor = options.arrowColor !== undefined ? options.arrowColor : 0;
  this.arrowHeadSize = options.arrowHeadSize !== undefined ? options.arrowHeadSize : 2;
  this.arrowHeadWidth = options.arrowHeadWidth !== undefined ? options.arrowHeadWidth : 0.8;

  this.linesColor = options.linesColor !== undefined ? options.linesColor : 0;
  this.lineWidth = options.lineWidth !== undefined ? options.lineWidth : 1;

  this.fontSize = options.fontSize !== undefined ? options.fontSize : 8;
  this.textColor = options.textColor !== undefined ? options.textColor : "#000";
  this.textBgColor = options.textBgColor !== undefined ? options.textBgColor : "#fff";
  this.labelType = options.labelType !== undefined ? options.labelType : "frontFacing";

  this.angle = options.angle !== undefined ? options.angle : 45;
  this.angleLength = options.angleLength !== undefined ? options.angleLength : 5;
  this.horizLength = options.horizLength !== undefined ? options.horizLength : 5;
  this.radius = options.radius !== undefined ? options.radius : 0;

  var angle = this.angle;
  var radius = this.radius;
  var angleLength = this.angleLength;
  var horizLength = this.horizLength;
  var horizLength = this.horizLength;

  var textBorder = options.textBorder || null;
  var material = new GizmoLineMaterial({ color: this.linesColor });
  //depthTest:false,depthWrite:false});

  var rAngle = angle;
  rAngle = rAngle * Math.PI / 180;
  var y = Math.cos(rAngle) * angleLength;
  var x = Math.sin(rAngle) * angleLength;
  var angleEndPoint = new THREE.Vector3(x, y, 0);
  angleEndPoint = angleEndPoint.add(angleEndPoint.clone().normalize().multiplyScalar(radius));
  var angleArrowDir = angleEndPoint.clone().normalize();
  angleEndPoint.x = -angleEndPoint.x;
  angleEndPoint.y = -angleEndPoint.y;

  this.angleArrow = new THREE.ArrowHelper(angleArrowDir, angleEndPoint, angleLength, this.color, this.arrowHeadSize, this.arrowHeadWidth);
  this.angleArrow.scale.z = 0.6;

  var horizEndPoint = angleEndPoint.clone();
  horizEndPoint.x -= horizLength;

  var horizGeom = new THREE.Geometry();
  horizGeom.vertices.push(angleEndPoint);
  horizGeom.vertices.push(horizEndPoint);

  this.horizLine = new THREE.Line(horizGeom, material);

  //draw dimention / text
  switch (this.labelType) {
    case "flat":
      console.log("this.fontSize", this.fontSize);
      this.label = new LabelHelperPlane({ text: this.text, fontSize: this.fontSize, background: this.textBgColor != null, color: this.textColor, bgColor: this.textBgColor });
      break;
    case "frontFacing":
      this.label = new LabelHelper3d({ text: this.text, fontSize: this.fontSize, color: this.textColor, bgColor: this.textBgColor });
      break;
  }
  this.label.rotation.z = Math.PI;
  var labelSize = this.label.textWidth / 2 + 1; //label size, plus some extra
  var labelPosition = horizEndPoint.clone().sub(new THREE.Vector3(labelSize, 0, 0));
  this.label.position.add(labelPosition);

  /*
  var precisionLabelPos = new THREE.Vector3().copy( labelPosition );
  precisionLabelPos.x += this.label.width;
  
  //TODO: this is both needed in the data structures & in the visuals (here)
  this.precision = 0.12;
  this.precisionText = "+"+this.precision+"\n"+"-"+this.precision;
  this.precisionLabel = new LabelHelperPlane({text:this.precisionText,fontSize:this.fontSize/1.5,background:(this.textBgColor!=null),color:this.textColor,bgColor:this.textBgColor});
  this.add( this.precisionLabel );
  
  this.precisionLabel.rotation.z = Math.PI;
  this.precisionLabel.position.copy( precisionLabelPos );*/

  var crossHelper = new CrossHelper({ size: 3 });
  this.add(crossHelper);

  if (textBorder) {
    if (textBorder == "circle") {
      var textBorderGeom = new THREE.CircleGeometry(labelSize, 30);
      textBorderGeom.vertices.shift();
      var textBorderOutline = new THREE.Line(textBorderGeom, material);
      textBorderOutline.position.add(labelPosition);
      this.add(textBorderOutline);
    }
  }

  this.add(this.angleArrow);
  this.add(this.horizLine);
  this.add(this.label);

  //material settings
  this.arrowLineMaterial = new GizmoLineMaterial({ color: this.arrowColor, linewidth: this.lineWidth, linecap: "miter" });
  this.arrowConeMaterial = new GizmoMaterial({ color: this.arrowColor });

  this.angleArrow.line.material = this.arrowLineMaterial;
  this.angleArrow.cone.material = this.arrowConeMaterial;
  this.angleArrow.line.material.depthTest = this.angleArrow.line.material.depthTest = true;
  this.angleArrow.line.material.depthWrite = this.angleArrow.line.material.depthWrite = true;

  //this.angleArrow.renderDepth = 1e20;
  this.horizLine.renderDepth = 100000000000000000000;
};

LeaderLineHelper.prototype = Object.create(BaseHelper.prototype);
LeaderLineHelper.prototype.constructor = LeaderLineHelper;

LeaderLineHelper.prototype.updateParams = function () {};

module.exports = LeaderLineHelper;

},{"../BaseHelper":5,"../CrossHelper":7,"../GizmoMaterial":8,"../LabelHelper":9}],18:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var BaseHelper = require("../BaseHelper");
var LineHelper = require("../LineHelper");
var CrossHelper = require("../CrossHelper");

var _require = require("../LabelHelper");

var LabelHelperPlane = _require.LabelHelperPlane;
var LabelHelper3d = _require.LabelHelper3d;

var _require2 = require("../GizmoMaterial");

var GizmoMaterial = _require2.GizmoMaterial;
var GizmoLineMaterial = _require2.GizmoLineMaterial;

/*
  Made of two main arrows, and two lines perpendicular to the main arrow, at both its ends
  If the VISUAL distance between start & end of the helper is too short to fit text + arrow:
   * arrows should be on the outside
   * if text does not fit either, offset it to the side
*/

//TODO: how to put items on the left instead of right, front instead of back etc

var SizeHelper = (function (BaseHelper) {
  function SizeHelper(options) {
    _classCallCheck(this, SizeHelper);

    var DEFAULTS = {
      _position: new THREE.Vector3(),
      centerColor: "#F00",
      crossColor: "#F00",

      drawArrows: true,
      drawLeftArrow: true,
      drawRightArrow: true,
      arrowColor: "000",
      arrowsPlacement: "dynamic", //can be either, dynamic, inside, outside
      arrowHeadSize: 2,
      arrowHeadWidth: 0.8,
      arrowFlatten: 0.3, //by how much to flatten arrows along their "up axis"

      lineWidth: 1, //TODO: how to ? would require not using simple lines but strips
      //see ANGLE issue on windows platforms
      drawSideLines: true,
      sideLength: 0,
      sideLengthExtra: 2, //how much sidelines should stick out
      sideLineColor: "000",
      sideLineSide: "front",

      drawLabel: true,
      labelPos: "center",
      labelType: "flat", //frontFacing or flat
      labelSpacingExtra: 0.5,
      fontSize: 10,
      fontFace: "Jura",
      textColor: "#000",
      textBgColor: "rgba(255, 255, 255, 0)",
      lengthAsLabel: true, //TODO: "length is too specific change that"
      text: "",
      textPrefix: "", //TODO: perhas a "textformat method would be better ??

      start: undefined,
      end: undefined,
      up: new THREE.Vector3(0, 0, 1),
      direction: undefined, //new THREE.Vector3(1,0,0),
      facingSide: new THREE.Vector3(0, 1, 0), //all placement computations are done relative to this one
      facingMode: "static", //can be static or dynamic
      length: 0,

      debug: false };

    this.DEFAULTS = DEFAULTS; //keep defaults
    var options = Object.assign({}, DEFAULTS, options);
    _get(Object.getPrototypeOf(SizeHelper.prototype), "constructor", this).call(this, options);

    Object.assign(this, options);

    //FIXME: do this better
    this.axisAligned = false;
    this.findGoodSide = true;
    this.debug = true;

    this.leftArrowPos = new THREE.Vector3();
    this.rightArrowPos = new THREE.Vector3();
    this.leftArrowDir = new THREE.Vector3();
    this.rightArrowDir = new THREE.Vector3();
    this.flatNormal = new THREE.Vector3(0, 0, 1);
    this.labelPosition = new THREE.Vector3();
    this.offsetLeftArrowPos = new THREE.Vector3();
    this.offsetRightArrowPos = new THREE.Vector3();

    this._setupVisuals();
    //constants
    //FIXME: horrible
    /*const LABELFITOK    = 0;
    const LABELFITSHORT = 1;
    const LABELNOFIT    = 2;
    
    this.LABELFITOK    = LABELFITOK;
    this.LABELFITSHORT = LABELFITSHORT;
    this.LABELNOFIT    = LABELNOFIT;*/
  }

  _inherits(SizeHelper, BaseHelper);

  _prototypeProperties(SizeHelper, null, {
    _computeBasics: {

      /* method compute all the minimal parameters, to have a minimal viable
      display of size
       parameter's priortity is in descending order as follows:
        - start & end
        - lengh & direction
       you can provide either:
        - start & end
        - start & length & direction
        - end & length & direction
      */

      value: function _computeBasics() {
        var _this = this;

        //either use provided length parameter , or compute things based on start/end parameters
        var start = this.start;
        var end = this.end;

        if (end && start) {
          var tmpV = end.clone().sub(start);
          this.length = tmpV.length();
          this.direction = tmpV.normalize();
        } else if (start && !end && this.direction && this.length) {
          end = this.direction.clone().multiplyScalar(this.length).add(start);
        } else if (end && !start && this.direction && this.length) {
          start = this.direction.clone().negate().multiplyScalar(this.length).add(end);
        } else if (this.direction && this.length) {
          start = this.direction.clone().multiplyScalar(-this.length / 2).add(this.position);
          end = this.direction.clone().multiplyScalar(this.length / 2).add(this.position);
        } else {
          //throw new Error("No sufficient parameters provided to generate a SizeHelper");
          return;
        }

        this.start = start;
        this.end = end;
        //MID is literally the middle point between start & end, nothing more
        this.mid = this.direction.clone().multiplyScalar(this.length / 2).add(this.start);

        //the size of arrows (if they are drawn) is max half the total length between start & end
        this.arrowSize = this.length / 2;
        this.leftArrowDir = this.direction.clone();
        this.rightArrowDir = this.direction.clone().negate();

        if (this.lengthAsLabel) this.text = this.length.toFixed(2);

        //HACK, for testing
        if (Math.abs(this.direction.z) - 1 <= 0.0001 && this.direction.x == 0 && this.direction.y == 0) {
          this.up = new THREE.Vector3(1, 0, 0);
        }

        var cross = this.direction.clone().cross(this.up);
        cross.normalize().multiplyScalar(this.sideLength);
        //console.log("mid", this.mid,"cross", cross);

        var bla = [0, 0, 0];
        var axes = ["x", "y", "z"];
        axes.forEach(function (axis, index) {
          if (_this.facingSide[axis] != 0) {
            bla[index] = cross[axis] * _this.facingSide[axis];
          } else {
            bla[index] = cross[axis];
          }
        });
        cross = new THREE.Vector3().fromArray(bla);
        console.log("cross", cross);

        this.leftArrowPos = this.mid.clone().add(cross);
        this.rightArrowPos = this.mid.clone().add(cross);
        this.flatNormal = cross.clone();

        //compute all the arrow & label positioning details
        this._computeLabelAndArrowsOffsets();
        //all the basic are computed, configure visuals
        this._updateVisuals();
      },
      writable: true,
      configurable: true
    },
    _computeLabelAndArrowsOffsets: {

      /* compute the placement for label & arrows
        determine positioning for the label/text:
        Different cases:
         - arrows pointing inwards:
          * if label + arrows fits between ends, put label between arrows
          * if label does not fit between ends
      */

      value: function _computeLabelAndArrowsOffsets() {
        var sideLength = this.sideLength;
        var length = this.length;
        var labelOrient = new THREE.Vector3(-1, 0, 1);
        var labelHeight = 0;
        var labelLength = 0;
        var innerLength = 0;
        var innerLengthHalf = 0;
        var labelSpacingExtra = this.labelSpacingExtra;
        var arrowHeadSize = this.arrowHeadSize;
        var arrowHeadsLength = this.arrowHeadSize * 2;
        var arrowSize = this.arrowSize;

        //generate invisible label/ text
        //this first one is used to get some labeling metrics, and is
        //not always displayed
        var label = new LabelHelperPlane({
          text: this.text,
          fontSize: this.fontSize,
          fontFace: this.fontFace,
          color: this.textColor,
          bgColor: this.textBgColor });
        label.position.copy(this.leftArrowPos);

        //calculate offset so that there is a hole between the two arrows to draw the label
        if (this.drawLabel) {
          labelLength = label.textWidth + labelSpacingExtra * 2;
          labelHeight = label.textHeight;
        }

        innerLength = labelLength + arrowHeadsLength;
        innerLengthHalf = innerLength / 2;

        /*cases
          - no label : just arrows: 
            - arrows get placed OUTSIDE if size too small (dynamic & inside too)
          - label: 
            - label + labelBorder  + arrowHeads X2 need to fit between start & end
            - dynamic :
              * (labelLength + labelBorder  + arrowHeads X2) < length : do nothing  IE : length - (labelLength + labelBorder) > (arrowHeads X2)
              * (labelLength + labelBorder) < length but not arrows IE  0 < ( length - (labelLength + labelBorder)) < (arrowHeads X2)
              
        */
        var remLength = length - labelLength;
        var roomForBoth = remLength > arrowHeadsLength; //arrow + label OK
        var roomForLabel = remLength > 0 && remLength < arrowHeadsLength; //only label OK
        var noRoom = remLength < 0; // no room in hell

        var actualPos = undefined; //we collapse all possibilities to something simple

        if (this.arrowsPlacement == "dynamic" || this.arrowsPlacement == "inner") {
          if (roomForBoth) //if the label + arrows would fit
            {
              this.arrowSize -= labelLength;
              this.leftArrowPos.add(this.leftArrowDir.clone().normalize().setLength(labelLength / 2));
              this.rightArrowPos.add(this.rightArrowDir.clone().normalize().setLength(labelLength / 2));
            }
          if (noRoom || roomForLabel) {

            this.arrowSize = Math.max(length / 2, 6); //we want arrows to be more than just arrowhead when we put it "outside"
            var arrowDist = length / 2 + this.arrowSize;

            //invert the direction of arrows , since we want them "OUTSIDE"
            this.leftArrowDir = this.direction.clone().negate();
            this.rightArrowDir = this.leftArrowDir.clone().negate();

            this.leftArrowPos.sub(this.leftArrowDir.clone().normalize().multiplyScalar(arrowDist));
            this.rightArrowPos.sub(this.rightArrowDir.clone().normalize().multiplyScalar(arrowDist));
          }
        } else if (this.arrowsPlacement == "outside") {
          //put the arrows outside of measure, pointing "inwards" towards center
          this.arrowSize = Math.max(length / 2, 6); //we want arrows to be more than just arrowhead in all the cases
          var arrowDist = this.length / 2 + this.arrowSize;

          this.leftArrowDir = this.direction.clone().negate();
          this.rightArrowDir = this.leftArrowDir.clone().negate();

          this.leftArrowPos.sub(this.leftArrowDir.clone().normalize().multiplyScalar(arrowDist));
          this.rightArrowPos.sub(this.rightArrowDir.clone().normalize().multiplyScalar(arrowDist));

          if (!roomForLabel) {
            //console.log("UH OH , this", this, "will not fit!!");
            //we want it "to the side" , aligned with the arrow, beyond the arrow head
            var lengthOffset = this.length / 2 + labelSpacingExtra + arrowHeadSize + labelLength / 2;
            this.labelPosition = this.leftArrowPos.clone().add(this.leftArrowDir.clone().normalize().setLength(lengthOffset));
            labelLength;
          }
        } else {
          this.arrowSize -= labelHoleHalfSize;
          this.leftArrowPos.add(this.leftArrowDir.clone().normalize().setLength(labelHoleHalfSize));
          this.rightArrowPos.add(this.rightArrowDir.clone().normalize().setLength(labelHoleHalfSize));
        }

        //offset the label based on centered/top/bottom setting
        switch (this.labelPos) {
          case "center":
            this.textHeightOffset = new THREE.Vector3();
            break;
          case "top":
            this.textHeightOffset = new THREE.Vector3().crossVectors(this.up, this.direction).setLength(labelHeight);
            break;
          case "bottom":
            this.textHeightOffset = new THREE.Vector3().crossVectors(this.up, this.direction).setLength(labelHeight).negate();
            break;
        }
      },
      writable: true,
      configurable: true
    },
    _setupVisuals: {
      value: function _setupVisuals() {
        //materials
        this.arrowLineMaterial = new GizmoLineMaterial({ color: this.arrowColor, linewidth: this.lineWidth, linecap: "miter" });
        this.arrowConeMaterial = new GizmoMaterial({ color: this.arrowColor });

        //arrows
        var sideLength = this.sideLength;
        var leftArrowDir, rightArrowDir, leftArrowPos, rightArrowPos, arrowHeadSize, arrowSize, leftArrowHeadSize, leftArrowHeadWidth, rightArrowHeadSize, rightArrowHeadWidth;

        leftArrowDir = this.leftArrowDir;
        rightArrowDir = this.rightArrowDir;
        leftArrowPos = this.leftArrowPos;
        rightArrowPos = this.rightArrowPos;

        arrowHeadSize = this.arrowHeadSize;
        arrowSize = this.arrowSize;

        leftArrowHeadSize = rightArrowHeadSize = this.arrowHeadSize;
        leftArrowHeadWidth = rightArrowHeadWidth = this.arrowHeadWidth;

        //direction, origin, length, color, headLength, headRadius, headColor
        this.mainArrowLeft = new THREE.ArrowHelper(leftArrowDir, leftArrowPos, arrowSize, this.arrowColor, leftArrowHeadSize, leftArrowHeadWidth);
        this.mainArrowRight = new THREE.ArrowHelper(rightArrowDir, rightArrowPos, arrowSize, this.arrowColor, rightArrowHeadSize, rightArrowHeadWidth);

        if (!this.drawLeftArrow) this.mainArrowLeft.cone.visible = false;
        if (!this.drawRightArrow) this.mainArrowRight.cone.visible = false;

        this.mainArrowLeft.line.material = this.arrowLineMaterial;
        this.mainArrowRight.line.material = this.arrowLineMaterial;

        this.mainArrowLeft.cone.material = this.arrowConeMaterial;
        this.mainArrowRight.cone.material = this.arrowConeMaterial;

        //Flaten in the UP direction(s) , not just z
        var arrowFlatten = this.arrowFlatten;
        var arrowFlatScale = new THREE.Vector3(arrowFlatten, arrowFlatten, arrowFlatten);
        var arrowFlatScale = new THREE.Vector3().multiplyVectors(this.up, arrowFlatScale);
        var axes = ["x", "y", "z"];
        axes.forEach(function (axis, index) {
          if (arrowFlatScale[axis] === 0) arrowFlatScale[axis] = 1;
        });
        this.mainArrowLeft.scale.copy(arrowFlatScale);
        this.mainArrowRight.scale.copy(arrowFlatScale);

        //for debuging
        //this.dirDebugArrow = new THREE.ArrowHelper(this.direction, this.mid, 20, "#F00", 3, 1);

        this.add(this.mainArrowLeft);
        this.add(this.mainArrowRight);
        //this.add( this.dirDebugArrow );

        this.mainArrowRight.renderDepth = this.mainArrowLeft.renderDepth = 100000000000000000000;
        this.mainArrowRight.depthTest = this.mainArrowLeft.depthTest = false;
        this.mainArrowRight.depthWrite = this.mainArrowLeft.depthWrite = false;
        //this.dirDebugArrow.depthWrite  = this.dirDebugArrow.depthTest = false;

        ////////sidelines
        this.leftSideLine = new LineHelper();
        this.rightSideLine = new LineHelper();

        this.add(this.rightSideLine);
        this.add(this.leftSideLine);

        ////////labels
        switch (this.labelType) {
          case "flat":
            this.label = new LabelHelperPlane({
              text: this.text,
              fontSize: this.fontSize,
              fontFace: this.fontFace,
              color: this.textColor,
              background: this.textBgColor != null,
              bgColor: this.textBgColor });
            break;
          case "frontFacing":
            this.label = new LabelHelper3d({
              text: this.text,
              fontSize: this.fontSize,
              fontFace: this.fontFace,
              color: this.textColor,
              bgColor: this.textBgColor });
            break;
        }
        this.label.position.copy(this.labelPosition);
        this.add(this.label);

        if (!this.drawLabel) {
          this.label.hide();
        } else {
          this.label.show();
        }

        //debug helpers
        this.debugHelpers = new BaseHelper();

        this.directionDebugHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 15, 16711680);
        this.upVectorDebugHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 15, 255);
        this.startDebugHelper = new CrossHelper({ color: 16711680 });
        this.midDebugHelper = new CrossHelper({ color: 255 });
        this.endDebugHelper = new CrossHelper({ color: 65280 });

        this.debugHelpers.add(this.directionDebugHelper);
        this.debugHelpers.add(this.upVectorDebugHelper);
        this.debugHelpers.add(this.startDebugHelper);
        this.debugHelpers.add(this.midDebugHelper);
        this.debugHelpers.add(this.endDebugHelper);

        this.add(this.debugHelpers);
        if (!this.debug) {
          this.debugHelpers.hide();
        } else {
          this.debugHelpers.show();
        }
      },
      writable: true,
      configurable: true
    },
    _updateVisuals: {
      value: function _updateVisuals() {
        var leftArrowDir, rightArrowDir, leftArrowPos, rightArrowPos, arrowHeadSize, arrowSize, leftArrowHeadSize, leftArrowHeadWidth, rightArrowHeadSize, rightArrowHeadWidth;

        leftArrowDir = this.leftArrowDir;
        rightArrowDir = this.rightArrowDir;
        leftArrowPos = this.leftArrowPos;
        rightArrowPos = this.rightArrowPos;

        arrowHeadSize = this.arrowHeadSize;
        arrowSize = this.arrowSize;

        this.mainArrowLeft.setLength(arrowSize, this.arrowHeadSize, this.arrowHeadWidth);
        this.mainArrowLeft.setDirection(leftArrowDir);
        this.mainArrowLeft.position.copy(leftArrowPos);

        this.mainArrowRight.setLength(arrowSize, this.arrowHeadSize, this.arrowHeadWidth);
        this.mainArrowRight.setDirection(rightArrowDir);
        this.mainArrowRight.position.copy(rightArrowPos);

        //Flaten arrows the UP direction(s)
        var arrowFlatten = this.arrowFlatten;
        var arrowFlatScale = new THREE.Vector3(arrowFlatten, arrowFlatten, arrowFlatten);
        var arrowFlatScale = new THREE.Vector3().multiplyVectors(this.up, arrowFlatScale);
        var axes = ["x", "y", "z"];
        axes.forEach(function (axis, index) {
          if (arrowFlatScale[axis] === 0) arrowFlatScale[axis] = 1;
        });
        this.mainArrowLeft.scale.copy(arrowFlatScale);
        this.mainArrowRight.scale.copy(arrowFlatScale);

        ///sidelines
        var sideLength = this.sideLength;
        var sideLengthExtra = this.sideLengthExtra;

        var sideLineStart = this.start.clone();
        var sideLineEnd = sideLineStart.clone().add(this.flatNormal.clone().setLength(sideLength + sideLengthExtra));
        var leftToRightOffset = this.end.clone().sub(this.start);

        this.leftSideLine.setStart(sideLineStart);
        this.leftSideLine.setEnd(sideLineEnd);

        this.rightSideLine.setStart(sideLineStart);
        this.rightSideLine.setEnd(sideLineEnd);
        this.rightSideLine.position.add(leftToRightOffset);

        ///label
        if (!this.drawLabel) {
          this.label.hide();
        } else {
          this.label.show();
        }
        this.label.setText(this.text);
        this.label.position.copy(this.labelPosition.clone().add(this.textHeightOffset));

        //make the label face the correct way
        var labelDefaultOrientation = new THREE.Vector3(-1, 0, 1);
        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(labelDefaultOrientation, this.direction.clone());
        //this.label.rotation.setFromQuaternion( quaternion );
        //this.label.rotation.z += Math.PI;

        //from http://stackoverflow.com/questions/15139649/three-js-two-points-one-cylinder-align-issue
        var orientation = new THREE.Matrix4(); //a new orientation matrix to offset pivot
        var offsetRotation = new THREE.Matrix4(); //a matrix to fix pivot rotation
        var offsetPosition = new THREE.Matrix4(); //a matrix to fix pivot position
        var up = new THREE.Vector3(0, 1, 0); //this.up;
        var HALF_PI = +Math.PI * 0.5;
        orientation.lookAt(this.start, this.end, up); //look at destination
        offsetRotation.makeRotationX(HALF_PI); //rotate 90 degs on X
        orientation.multiply(offsetRotation); //combine orientation with rotation transformations
        //this.label.applyMatrix(orientation);

        //debug helpers
        this.directionDebugHelper.setDirection(this.direction);
        this.upVectorDebugHelper.setDirection(this.up);
        this.startDebugHelper.position.copy(this.start);
        this.midDebugHelper.position.copy(this.mid);
        this.endDebugHelper.position.copy(this.end);

        if (!this.debug) {
          this.debugHelpers.hide();
        } else {
          this.debugHelpers.show();
        }
      },
      writable: true,
      configurable: true
    },
    set: {
      value: function set() {},
      writable: true,
      configurable: true
    },
    setFromParams: {

      //setters

      /* set all parameters from options */

      value: function setFromParams(options) {
        var options = Object.assign({}, this.DEFAULTS, options);

        Object.assign(this, options);

        this.leftArrowPos = new THREE.Vector3();
        this.rightArrowPos = new THREE.Vector3();
        this.leftArrowDir = new THREE.Vector3();
        this.rightArrowDir = new THREE.Vector3();
        this.flatNormal = new THREE.Vector3(0, 0, 1);
        this.labelPosition = new THREE.Vector3();
        this.offsetLeftArrowPos = new THREE.Vector3();
        this.offsetRightArrowPos = new THREE.Vector3();

        this._computeBasics();
      },
      writable: true,
      configurable: true
    },
    setUp: {
      value: function setUp(up) {
        this.up = up !== undefined ? up : new THREE.Vector3(0, 0, 1);

        this._computeBasics();
      },
      writable: true,
      configurable: true
    },
    setDirection: {
      value: function setDirection(direction) {
        this.direction = direction || new THREE.Vector3(1, 0, 0);

        this._computeBasics();
      },
      writable: true,
      configurable: true
    },
    setLength: {
      value: function setLength(length) {},
      writable: true,
      configurable: true
    },
    setSideLength: {
      value: function setSideLength(sideLength) {
        this.sideLength = sideLength !== undefined ? sideLength : 0;

        this._computeBasics();
      },
      writable: true,
      configurable: true
    },
    setText: {
      value: function setText(text) {
        this.text = text !== undefined ? text : "";

        this._computeBasics();
      },
      writable: true,
      configurable: true
    },
    setStart: {
      value: function setStart(start) {

        this.start = start || new THREE.Vector3();

        this._computeBasics();
        /*var tmpV = this.end.clone().sub( this.start ) ;
        this.length = tmpV.length();
        this.direction = tmpV.normalize();
        
        this._recomputeMidDir();*/
      },
      writable: true,
      configurable: true
    },
    setEnd: {
      value: function setEnd(end) {
        this.end = end || new THREE.Vector3();

        this._computeBasics();

        /*var tmpV = this.end.clone().sub( this.start ) ;
        this.length = tmpV.length();
        this.direction = tmpV.normalize();
        
        this._recomputeMidDir();*/
      },
      writable: true,
      configurable: true
    },
    setFacingSide: {
      value: function setFacingSide(facingSide) {
        this.facingSide = facingSide || new THREE.Vector3();

        this._computeBasics();
      },
      writable: true,
      configurable: true
    }
  });

  return SizeHelper;
})(BaseHelper);

module.exports = SizeHelper;

/*this.length = length !== undefined ? length : 10;

this.start = this.direction.clone().multiplyScalar( -this.length/2).add( this._position );
this.end   = this.direction.clone().multiplyScalar( this.length/2).add( this._position );
    this._recomputeMidDir();  */

},{"../BaseHelper":5,"../CrossHelper":7,"../GizmoMaterial":8,"../LabelHelper":9,"../LineHelper":10}]},{},[16])(16)
});