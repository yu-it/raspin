var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("ui-con:" +req.query)
  res.render('ui-controller-view', { pvid: req.query.pvid,pvname: req.query.pvname,available_message: req.query.available_message,arg_count: req.query.arg_count});
});


module.exports = router;
