var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('frame_of_ui');
});
router.get('/process', function(req, res, next) {
  res.render('frame_of_process',{"process_name":req.param("process_name"),"disp_name":req.param("disp_name")});
});
router.get('/if_numbers', function(req, res, next) {
  res.render('frame_of_if_numbers',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name"),"unit":req.param("unit"),"scale":req.param("scale")});
});
//(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons)
router.get('/if_messages', function(req, res, next) {
  res.render('frame_of_if_messages',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name")});
});
router.get('/if_logs', function(req, res, next) {
  res.render('frame_of_if_logs',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name")});
});
router.get('/if_arrows', function(req, res, next) {
  res.render('frame_of_if_arrows',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name"),"enable":req.param("enable")});
});
router.get('/if_toggles', function(req, res, next) {
  res.render('frame_of_if_toggles',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name"),"default_val":req.param("default_val")});
});
router.get('/if_buttons', function(req, res, next) {
  res.render('frame_of_if_buttons',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name")});
});
router.get('/if_videos', function(req, res, next) {
  res.render('frame_of_if_videos',{"if_name":req.param("if_name"),"disp_name":req.param("disp_name")});
});


module.exports = router;
