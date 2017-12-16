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

router.get('/sse/emitter', function(req, res, next) {
  ev.emit(req.param("ev"),req.param("data"))  
  res.send("accepted")
});


ev.on("data", function(dat) {
  console.log(dat)
})
ev.on("data2", function(dat) {
  console.log("data2:" + dat)
})
ev.on("ch3", function(dat) {
  console.log("ch3:" + dat)
})
module.exports = router;
