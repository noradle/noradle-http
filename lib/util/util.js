"use strict";
var fs = require('fs')
  , crypto = require('crypto')
  , createHash = crypto.createHash
  ;

exports.noop = function(){
  ;
};

exports.parseCookie = function(req){
  var cookies = {}
    , hdrCookie = req.headers.cookie
    , nv
    ;
  hdrCookie && hdrCookie.split(/[;,] */).forEach(function(cookie){
    nv = cookie.split(/\s*=\s*/);
    cookies[nv[0]] = nv[1];
  });
  delete req.headers.cookie;
  return cookies;
};

exports.defaultErrorPage = function(req, res, e){
  res.writeHead(500, {'Content-Type' : 'text/html'});
  res.write('PSP.WEB middleware exception:<pre>');
  res.write(inspect(e));
  res.end('</pre>');
};

// todo : must support async method, or it will block the only execution thread
exports.ensureDir = function(path){
  console.log('util.ensureDir', path);
  var sects = path.split('/');
  var len = sects.length - 1;
  for (var i = len; i > 0; i--) {
    var tryPath = sects.slice(0, i).join('/');
    try {
      var stat = fs.statSync(tryPath);
      // if (stat.isDirectory()) ...;
    } catch (e) {
      continue;
    }
    break;
  }
  for (var j = i; j < len; j++) {
    tryPath = sects.slice(0, j + 1).join('/');
    fs.mkdirSync(tryPath);
  }
};

exports.mergeAdd = function(def, setting){
  for (var n in setting)
    if (!(n in def)) {
      def[n] = setting[n];
    }
  return def;
};

exports.override = function(def, setting){
  var cfg = {};
  for (var n in def) cfg[n] = (n in setting) ? setting[n] : def[n];
  return cfg;
};

exports.override2 = function(def, setting){
  setting = setting || {};
  for (var n in def)
    if (n in setting)
      def[n] = setting[n];
    else
      def[n] = def[n];
  return def;
};

exports.mergeHeaders = function(obj1, obj2){
  for (var n in obj2) {
    var v = obj2[n];
    if (v instanceof Array) {
      var v1 = obj1[n];
      if (!v1) {
        obj1[n] = v;
      } else if (v1 instanceof String) {
        obj1[n] = v.unshift(v1);
      } else {
        obj1[n] = obj1[n].concat(v);
      }
    } else {
      obj1[n] = v;
    }
  }
};

exports.find = function(arr, item, func){
  func = func || function(p){
      return p;
    };
  for (var i = 0, len = arr.length; i < len; i++) {
    if (func(arr[i]) === item)
      return i;
  }
  return -1;
};

exports.makeArray = function(size){
  var r = new Array(size);
  for (var i = 0; i < size; i++) r[i] = i;
  return r;
};

exports.dummy = function(){
  ;
};

var ranges = [
  [32, 42],
  [44, 46],
  [58, 60],
  [62, 64],
  [91, 96],
  [123, 126]
];
var charMap = [];
ranges.forEach(function(span){
  for (var i = span[0]; i <= span[1]; i++) {
    charMap.push(String.fromCharCode(i));
  }
});
charMap = charMap.join('');

function base64alt(hash){
  return hash.replace(/[a-z]/g, function(char){
    return charMap[char.charCodeAt(0) - 97];
  });
}
// console.log(exports.base64alt('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/='));

function stripTag(v){
  return v.replace(/(%3C|%3E)/g, function(s){
    if (s === '%3C') {
      return '%26lt%3B';
    } else if (s === '%3E') {
      return '%26gt%3B';
    }
  });
}

exports.nvStripTag = function nvStripTag(obj){
  for (var n in obj) {
    if (obj.hasOwnProperty(n)) {
      var v = obj[n];
      if (v instanceof Array) {
        v.forEach(function(c, i){
          if (typeof v === 'string') {
            v[i] = stripTag(v[i]);
          }
        });
      } else if (typeof v === 'string') {
        obj[n] = stripTag(v);
      }
    }
  }
  return obj;
};

function hash(value){
  return createHash('md5').update(value || '').digest('base64').slice(0, 22);
}

function hash2(value){
  return base64alt(hash(value));
}

exports.base64alt = base64alt;
exports.hash = hash;
exports.hash2 = hash2;

exports.random = function(){
  return crypto.randomBytes(4).toString('hex');
};

if (process.argv[1] === __filename) {
  console.log(charMap);
}
