var express = require('express');
var router = express.Router();
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter();
/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("ut start" +req.query)
  var client = require('redis').createClient().flushall(function(){
      res.render('ut-server');
    });
  
});
var resps=[]
function sse_response_initialize(res) {
  // 55秒のタイムアウト対策
  res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // disable nginx proxy buffering
  })
  var timeout_func = function() {
      if (!res._headerSent) {
          res.write(':\n\n');  
          res.flush() 
          setTimeout(timeout_func, 5000)
      }
      
  }
  var timer = setTimeout(timeout_func, 50000);

  // 最初の30秒のタイムアウト対策
  res.write(':\n\n');  
  res.flush()     
  resps.push(res)
}

router.get('/sse/emitter', function(req, res, next) {
  ev.emit("data",req.param("data"))  
  res.send("accepted")
});
router.get('/sse/receive', function(req, res, next) {
  sse_response_initialize(res)
});


ev.on("data", function(dat) {
  resps.forEach(function(res){
    res.write("event: ev\n")
    res.write("data: " + dat)
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n")
    res.write("dum: ev\n\n")
    res.flush()
  })
})
ev.on("data2", function(dat) {
  console.log("data2:" + dat)
})
ev.on("ch3", function(dat) {
  console.log("ch3:" + dat)
})
module.exports = router;
