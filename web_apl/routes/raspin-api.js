var express = require('express');
var logics = require('../private-logics/raspin-api.logic');
var router = express.Router();

var res_OK = JSON.stringify({"ret":"ok"})
var res_NG = JSON.stringify({"ret":"ng"})
function call_stored_procedure(db,func) {
  
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  db.eval('db.loadServerScripts()',
    //err
    function(err,seq) {
      func(err,seq,db);
    }
  )

}
//http://localhost:3000/raspin-api/ping
router.get('/ping', function(req, res, next) {
  res.send(res_OK)
});

//http://localhost:3000/raspin-api/RegistControllerProvider?pvname=test_name&queue_size=200&message_name=on&message_name=end&arg_count=1&arg_count=2
router.get('/SendToController', function(req, res, next) {
       logics.SendControllMessage(res,req.query.pvid ,req.query.message, req.query.arg, 100)
});
//http://localhost:3000/raspin-api/RegistControllerProvider?pvname=test_name&queue_size=200&message_name=on&message_name=end&arg_count=1&arg_count=2
router.get('/SubscribeControlMessage', function(req, res, next) {
      logics.SubscribeControlMessage(res, req.query.pvid)
});
//http://localhost:3000/raspin-api/RegistControllerProvider?pvname=test_name&queue_size=200&message_name=on&message_name=end&arg_count=1&arg_count=2
router.get('/Acknowledge', function(req, res, next) {

      var pvid = req.query.pvid
      var req_id = req.query.req_id
      var ret = req.query.ret
      var u = req.query.u
      var d = req.query.d
      if (ret == "1") {
        if (!array.isArray(u)) {
          u = [u]
        }
        if (!array.isArray(d)) {
          d = [d]
        }
        var jsontag = {"tag":{"ret": ret, "u":u, "d":d}}
      } else {
        var jsontag = {"tag":{"ret": ret}}

      }
      
      logics.Acknowledge(res,pvid,req_id,jsontag)
});
//http://localhost:3000/raspin-api/RegistControllerProvider?pvname=test_name&queue_size=200&message_name=on&message_name=end&arg_count=1&arg_count=2
router.get('/RegistControllerProvider', function(req, res, next) {
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var message_names = req.query.message_name
  var arg_counts = req.query.arg_count

  if (!Array.isArray(message_names)) {
     message_names = [ message_names]
     arg_counts = [ arg_counts]
  }
  var available_messages = []
  for (var i = 0; i < message_names.length; i++) {
    var mess_rec = {"message_name": message_names[i], "arg_count":arg_counts[i]}
    available_messages.push(mess_rec)
  }
  logics.RegistControllerProvider(res, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages})
});
//http://localhost:3000/raspin-api/ModControllerProvider?pvid=2&pvname=test_name_mod&queue_size=150&message_name=on_mod&message_name=end&arg_count=1&arg_count=3
router.get('/ModControllerProvider', function(req, res, next) {
  var pvid = req.query.pvid
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var message_names = req.query.message_name
  var arg_counts = req.query.arg_count

  var available_messages = []
  for (var i = 0; i < message_names.length; i++) {
    var mess_rec = {"message_name": message_names[i], "arg_count":arg_counts[i]}
    available_messages.push(mess_rec)
  }
  logics.ModControllerProvider(res, pvid, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages})
});
//http://localhost:3000/raspin-api/RegistDataProvider?pvname=test_data_provider&queue_size=2000&type=num
router.get('/RegistDataProvider', function(req, res, next) {
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var type = req.query.type

  logics.RegistDataProvider(res, {"pvname": pvname, "queue_size": queue_size,"type": type})
});
//http://localhost:3000/raspin-api/DeleteProvider?pvid=2
router.get('/DeleteProvider', function(req, res, next) {
  var pvid = req.query.pvid
  logics.DeleteProvider(res,pvid)
});

//http://localhost:3000/raspin-api/AddOvservationData?pvid=1&data=200
router.get('/AddOvservationData', function(req, res, next) {
  var pvid = req.query.pvid
  var data = req.query.data
  logics.AddOvservationData(res,pvid,data)
});

/* GET users listing. */
router.get('/AvailableControllerProvider', function(req, res, next) {
  logics.AvailableControllerProvider(res)

});
//http://localhost:3000/raspin-api/AvailableDataProvider
router.get('/AvailableDataProvider', function(req, res, next) {
  logics.AvailableDataProvider(res)
});
//http://localhost:3000/raspin-api/getOvservationData?pvid=1&previous_processed_data_id=
router.get('/GetOvservationData', function(req, res, next) {
  // Connection URL
  if (Array.isArray(req.query.pvid)) {
    var pvids = req.query.pvid
    var preq_id = req.query.previous_processed_data_id
    
  } else {
    var pvids = [req.query.pvid]
    var preq_id = [req.query.previous_processed_data_id]

  }
  // Use connect method to connect to the server
  logics.GetOvservationData(res, pvids, preq_id)

});

module.exports = router;
