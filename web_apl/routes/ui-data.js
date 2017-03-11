var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.query)
  res.render('ui-data-view', { pvid: req.query.pvid,pvname: req.query.pvname,type: req.query.type});
});

module.exports = router;
