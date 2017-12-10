var express = require('express');
var url = require('url'); // built-in utility
var router = express.Router();
router.use("/:aspect", function(req, res, next) {
  req.params["aspect"] = req.param("aspect");
  req.aspect = req.param("aspect");
  req.resource_id = url.parse(req.url.replace("/" + req.param("aspect"),"")).pathname;
  
  next();
});

module.exports = router;
