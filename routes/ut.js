var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("ut start" +req.query)
  var client = require('redis').createClient().flushall(function(){
      res.render('ut-server');
    });
  
});


module.exports = router;
