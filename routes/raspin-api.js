var express = require('express');
var logics = require('../private-logics/raspin-api.logic');
var router = express.Router();
var url = require('url'); // built-in utility

var url_ping =                       "/ping"
var url_machines =                   "/machines"
var url_machine =                    "/machines/:machine_name"
var url_check_invalid_machine_name = "/machines/:machine_name/*"
var url_processes =                  "/machines/:machine_name/processes/"
var url_process =                    "/machines/:machine_name/processes/:process_name"
var url_check_invalid_process_name = "/machines/:machine_name/processes/:process_name/*"
//var url_if =                         "/machines/:machine_name/processes/:process_name/if"
var url_ifs =                  "/machines/:machine_name/processes/:process_name/:if_kind(if_(numbers|messages|logs|arrows|toggles|buttons))"
var url_if =                  "/machines/:machine_name/processes/:process_name/:if_kind(if_(numbers|messages|logs|arrows|toggles|buttons))/:if_name"
var url_disable_rules =              "/machines/:machine_name/processes/:process_name/:if_kind(if_(numbers|messages|logs|arrows|toggles|buttons))/:if_name/disable_rules"
var url_hiding_rules =               "/machines/:machine_name/processes/:process_name/:if_kind(if_(numbers|messages|logs|arrows|toggles|buttons))/:if_name/hiding_rules"

function check_resource(req,res,next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id .replace("/"+req.param(0),""),
    function(){next()},
    return_404)
}
function req_log(req) {
  log("method:" + req.method + " " + req.originalUrl + "(" + req.path + ")#" + req.resource_id)
}
function log(str) {
  console.log(str)
}

function return_200(req,res) {
  res.writeHead(200);
  res.end();
}
function return_404(req,res) {
  res.writeHead(404);
  res.end();
}
router.get(url_ping, function(req, res, next) {
  req_log(req)
  res.writeHead(200);
  res.end();
});
router.get(url_machines, function(req, res, next) {
  req_log(req)
  logics.get_machines(req,res);
});
router.put(url_machine, function(req, res, next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id,
    return_200,
    logics.put_machine);
});

router.get(url_machine, function(req, res, next) {
  req_log(req)
  logics.get_machine(req,res);
});

router.delete(url_machine, function(req, res, next) {
  req_log(req)
  logics.delete_machine(req,res, next);
});

//以下のものは親machineの存在が前提になる。
router.use(url_check_invalid_machine_name, check_resource)
//processs
router.get(url_processes, function(req, res, next) {
  req_log(req)
    logics.get_processes(req,res)
  }
)

//processs
router.put(url_process, function(req, res, next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id,
    return_200,
    logics.put_process);
});
router.get(url_process, function(req, res, next) {
  req_log(req)
    logics.get_process(req,res)
  })
router.delete(url_process, function(req, res, next) {
  req_log(req)
    logics.del_process(req,res)
  })
//以下のものは親processの存在が前提になる。
router.use(url_check_invalid_process_name, check_resource)
router.get(url_ifs, function(req, res, next) {
  req_log(req)
  logics.get_ifs(req,res);
});

//if
router.put(url_if, function(req, res, next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id,
    return_200,
    logics.put_if);
});
router.get(url_if, function(req, res, next) {
  req_log(req)
    logics.get_if(req,res)
  })
router.delete(url_if, function(req, res, next) {
  req_log(req)
    logics.del_if(req,res)
  })



//http://localhost:3000/raspin-api/SendToController?pvid=1&message=on&arg=1
router.get('/SendToController', function(req, res, next) {
       logics.SendControllMessage(res,req.query.pvid ,req.query.message, req.query.arg, 100)
});
//http://localhost:3000/raspin-api/SubscribeControlMessage?pvid=5
router.get('/SubscribeControlMessage', function(req, res, next) {
      logics.SubscribeControlMessage(res, req.query.pvid)
});
//http://localhost:3000/raspin-api/Acknowledge?pvid=1&ret=0&req_id=10
router.get('/Acknowledge', function(req, res, next) {

      var pvid = req.query.pvid
      var req_id = req.query.req_id
      var ret = req.query.ret
      var u = req.query.u
      var d = req.query.d
      if (ret == "1") {
        if (!Array.isArray(u)) {
          u = [u]
        }
        if (!Array.isArray(d)) {
          d = [d]
        }
        var jsontag = {"tag":{"ret": ret, "u":u, "d":d}}
      } else {
        var jsontag = {"tag":{"ret": ret}}

      }
      
      logics.Acknowledge(res,pvid,req_id,jsontag)
});
//http://localhost:3000/raspin-api/RegisterControllerProvider?pvname=test_name&queue_size=200&message_name=on&message_name=end&arg=1&arg=2
router.get('/RegisterControllerProvider', function(req, res, next) {
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var message_names = req.query.message_name
  var args = req.query.arg

  if (!Array.isArray(message_names)) {
     message_names = [ message_names]
     args = [ args]
  }
  var available_messages = []
  for (var i = 0; i < message_names.length; i++) {
    var mess_rec = {"message_name": message_names[i], "arg":args[i]}
    available_messages.push(mess_rec)
  }
  if ("layout_param" in req.query) {
      logics.RegistControllerProvider(res, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages, "layout_param": req.query.layout_param})

  } else {
      logics.RegistControllerProvider(res, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages})

  } 
});
//http://localhost:3000/raspin-api/ModControllerProvider?pvid=2&pvname=test_name_mod&queue_size=150&message_name=on_mod&message_name=end&arg_count=1&arg_count=3
router.get('/ModControllerProvider', function(req, res, next) {
  var pvid = req.query.pvid
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var message_names = req.query.message_name
  var args = req.query.arg

  if (!Array.isArray(message_names)) {
     message_names = [ message_names]
     args = [ args]
  }
  var available_messages = []
  for (var i = 0; i < message_names.length; i++) {
    var mess_rec = {"message_name": message_names[i], "arg":args[i]}
    available_messages.push(mess_rec)
  }
  if ("layout_param" in req.query) {
      logics.ModControllerProvider(res, pvid, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages, "layout_param": req.query.layout_param})
  } else {
      logics.ModControllerProvider(res, pvid, {"pvname": pvname, "queue_size": queue_size,"available_message": available_messages})

  }
});
//http://localhost:3000/raspin-api/RegisterDataProvider?pvname=test_data_provider&queue_size=2000&type=num
router.get('/RegisterDataProvider', function(req, res, next) {
  var pvname = req.query.pvname
  var queue_size = req.query.queue_size
  var type = req.query.type
  var datadesc = {"pvname": pvname, "queue_size": queue_size,"type": type}
  if ("layout_param" in req.query) {
      datadesc["layout_param"] = req.query.layout_param
  }
  if ("unit" in req.query) {
      datadesc["unit"] = req.query.unit
  }

  logics.RegistDataProvider(res, datadesc)

});
//http://localhost:3000/raspin-api/DeleteProvider?pvid=2
router.get('/DeleteProvider', function(req, res, next) {
  var pvid = req.query.pvid
  logics.DeleteProvider(res,pvid)
});

//http://localhost:3000/raspin-api/AddObservationData?pvid=1&data=200
router.get('/AddObservationData', function(req, res, next) {
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
