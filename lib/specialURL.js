/**
 * Created by cuccpkfs on 15-9-15.
 */
"use strict";

var urlParse = require('url').parse
  , fs = require('fs')
  , path = require('path')
  , noradleResultsets = require('noradle-resultsets')
  , fileRSParser = noradleResultsets.fileRSParser
  , fileNGResultsetsConverter = noradleResultsets.fileNGResultsetsConverter
  , fileJQResultsetsConverter = noradleResultsets.fileJQResultsetsConverter
  ;

exports.handler = function(req, res, next, cfg){

  if (req.url.substr(0, 3) !== '/_/') return false;

  var u = urlParse(req.url.substr(2));

  if (u.pathname === '/about') {
    res.end('NORADLE for PL/SQL http servlet');
    return true;
  } else if (u.pathname.substr(0, 4) === '/js/') {
    return noradleResultsets.serveFile(res, path.substr(4));
  } else {
    return false;
  }
};