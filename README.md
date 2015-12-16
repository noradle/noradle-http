APIs
==========

* create a DBPool instance
* embed noradle.handlerHTTP for a node http server
* join static with expressjs
* use with experssjs(static) / harp / socket.io example

create a DBPool instance
------------------------

```javascript
var DBDriver = require('noradle-nodejs-client').DBDriver;
var dbPool = DBDriver.connect([port, host], {cid : 'client_identifier', passwd : 'password for the client'})
```

* [port,host] is the same parameters as [net.connect] API
* 2nd parameter is cid:passwd, to allow noradle dispatcher to accept connection

noradle.HTTP for a node http server
------------------------------------

```javascript
var httpHandler = require('noradle-http')(dbPool, customizedReqBase, configOptions)
```

* dbPool is created by `require('noradle-nodejs-client').DBDriver.connect`
* customizedReqBase is a constructor function who can set name-value pairs to send to oracle, like [internal ReqBase][]
* configOptions is customized configuration object that set or override default options, all available cfg is [here][configuration]
* what `require('noradle-http')` return is just a normal [node http handler][node http] like `function(request, response){...}`

join static with [express][express(en)]
--------------------------------------------

* noradle doesn't support static file service
* you can use  [express][express(en)]'s static module or any static service module
* you can use [express][express(en)] or other node http server module to set route to noradle servlet and static module, combine them in one http server

```javascript
...
var express = require('express')
  , app = express()
  ;

app.use('/staticMountPoint/', express.static('/some-mount-point-for-static-files/noradle-demo/static'));
app.use(require('noradle-http')(...));
app.listen(1520);
```

examples
==========

a servlet only http server
---------------------------

* only dynamic plsql servlet server,  without static file service
* use node's internal http module only, no [express][express(ch)] included
* no customized ReqBase
* use default configuration for noradle.HTTP

```javascript
var DBDriver = require('noradle-nodejs-client').DBDriver
  , dbPool = DBDriver.connect([8019, 'qhtapp1'], {cid : 'demo', passwd : 'demo'})
  , pspHandler = require('noradle-http')(dbPool)
  , http = require('http')
  ;
http.createServer(pspHandler).listen(1520);
```  

a servlet only http server with customized ReqBase
---------------------------------------------------

* in customized ReqBase(a constructor function), set `this.name` to create or replace name-value pair that's about to send into oracle
* some name like "x$xxx" have special meaning, that control the servlet processing behavior, see [oraReq-control-headers][]

```javascript
function myReqBase(req, cfg){
  // set some name-value pair to oracle, in plsql, r.getc('name1') will get 'value1'
  this.name1 = 'value1';
  // map all request to plsql procedure "basic_io_b.req.info"
  this.x$prog = 'basic_io_b.req_info';
}
var DBDriver = require('noradle-nodejs-client').DBDriver
  , dbPool = DBDriver.connect([8019, 'qhtapp1'], {cid : 'demo', passwd : 'demo'})
  , pspHandler = require('noradle-http')(dbPool, myReqBase)
  , http = require('http')
  ;
http.createServer(pspHandler).listen(1520);
```  

a servlet only http server with customized config
---------------------------------------------------

* you can provide none-default [configuration][] (a object type) for noradle.HTTP

```javascript
var DBDriver = require('noradle-nodejs-client').DBDriver
  , dbPool = DBDriver.connect([8019, 'qhtapp1'], {cid : 'demo', passwd : 'demo'})
  , pspHandler = require('noradle-http')(dbPool, {
    static_url : 'http://noradle-demo.some-static-cdn.com',
    upload_dir : __dirname + '/upload'
  })
  , http = require('http')
  ;
http.createServer(pspHandler).listen(1520);
```  

a servlet and static server using [express][express(en)]
--------------------------------------------------------

* mount static handler for "/demo1/" first, avoid go through noradle.HTTP handler for every static request
* in "myReqBase", tell noradle the base url for static url reference is "/demo1/"

```javascript
var staticMountPoint = '/demo1/';

function myReqBase(req, cfg){
  this.y$static = staticMountPoint;
}

var DBDriver = require('noradle-nodejs-client').DBDriver
  , dbPool = DBDriver.connect([8019, 'qhtapp1'], {cid : 'demo', passwd : 'demo'})
  , pspHandler = require('noradle-http')(dbPool, myReqBase)
  , express = require('express')
  , app = express()
  ;

app.use(staticMountPoint, express.static('/Users/cuccpkfs/dev/project/noradle-demo/static'));
app.use(pspHandler);
app.listen(1520);
```

  [express(ch)]: http://www.expressjs.com.cn/
  [express(en)]: http://expressjs.com/
  [oraReq-control-headers]: https://github.com/kaven276/noradle/wiki/oraReq-control-headers
  [configuration]: https://github.com/kaven276/noradle/blob/master/lib/cfg.js
  [net.connect]: https://nodejs.org/api/net.html
  [internal ReqBase]: https://github.com/kaven276/noradle/blob/master/lib/ReqBase.js
  [node http]: https://nodejs.org/api/http.html