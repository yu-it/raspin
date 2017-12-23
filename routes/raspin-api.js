//注意！pingでflush（テスト用）
var client = require('redis').createClient();


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
//var url_if =                       "/machines/:machine_name/processes/:process_name/if"
var url_ifs =                        "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)"
var url_ifs_all =                        "/machines/:machine_name/processes/:process_name/ifs"
var url_if =                         "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name"
var url_machine_disable_rules =      "/machines/:machine_name/disable_rules/*"
var url_machine_hiding_rules =       "/machines/:machine_name/hiding_rules/*"
var url_process_disable_rules =      "/machines/:machine_name/processes/:process_name/disable_rules/*"
var url_process_hiding_rules =       "/machines/:machine_name/processes/:process_name/hiding_rules/*"
var url__if_disable_rules =          "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/disable_rules/*"
var url_if_hiding_rules =            "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/hiding_rules/*"
var url_check_invalid_if_name = "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/*"

var url_machine_disable_rules_get_alias =      "/machines/:machine_name/disable_rules"
var url_machine_hiding_rules_get_alias =       "/machines/:machine_name/hiding_rules"
var url_process_disable_rules_get_alias =      "/machines/:machine_name/processes/:process_name/disable_rules"
var url_process_hiding_rules_get_alias =       "/machines/:machine_name/processes/:process_name/hiding_rules"
var url__if_disable_rules_get_alias =          "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/disable_rules"
var url_if_hiding_rules_get_alias =            "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/hiding_rules"
var url_if_data =                         "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/data"
var url_if_data_signal =                         "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/data/signal"
var url_if_data_reply =                         "/machines/:machine_name/processes/:process_name/:if_kind(if_numbers|if_messages|if_logs|if_arrows|if_toggles|if_buttons|if_videos)/:if_name/data/reply/:ack_id"



function check_resource(req,res,next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id .replace("/"+req.param(0),""),
    function(){next()},
    return_404)
}
function req_log(req) {
  var logstr = "method:" + req.method + " " + req.originalUrl + "(" + req.path + ")#" + req.resource_id
  for (k in req.body) {
    logstr += "," + k + "=" + req.body[k];
    req.params[k.replace("[]","")] = req.body[k];
  };
  log(logstr)
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
  client.flushall()
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
router.use(url_check_invalid_if_name, check_resource)
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
router.get(url_ifs_all, function(req, res, next) {
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
router.put(url_if_data, function(req, res, next) {
  req_log(req)
  logics.check_resource(req,
    res,
    req.resource_id.replace("/data",""),
    logics.put_if_data,
    return_404);
    
  })
router.get(url_if, function(req, res, next) {
  req_log(req)
    logics.get_if(req,res)
  })
router.delete(url_if, function(req, res, next) {
  req_log(req)
    logics.del_if(req,res)
  })

var url_list = [url_machine_disable_rules,
url_machine_hiding_rules,
url_process_disable_rules,
url_process_hiding_rules,
url__if_disable_rules,
url_if_hiding_rules]
url_list.forEach(function(url) {
  router.get(url, function(req, res, next) {
      req_log(req)
      logics.get_rules(req,res, req.resource_id.replace("/"+req.param(0),""))
    })
    router.put(url, function(req, res, next) {
      req_log(req)
        logics.put_rules(req,res, req.resource_id.replace("/"+req.param(0),""))
      })
    router.delete(url, function(req, res, next) {
      req_log(req)
        logics.del_rules(req,res, req.resource_id.replace("/"+req.param(0),""))
      })
})
url_list = [url_machine_disable_rules_get_alias,
  url_machine_hiding_rules_get_alias,
  url_process_disable_rules_get_alias,
  url_process_hiding_rules_get_alias,
  url__if_disable_rules_get_alias,
  url_if_hiding_rules_get_alias]
url_list.forEach(function(url) {
  router.get(url, function(req, res, next) {
    req_log(req)
      logics.get_rules(req,res,req.resource_id.replace("/"+req.param(0),""))
    })
    router.delete(url, function(req, res, next) {
      req_log(req)
        logics.del_rules(req,res,req.resource_id.replace("/"+req.param(0),""))
      })
})
    
router.get(url_if_data, function(req, res, next) {
  req_log(req)
    logics.get_if_data(req,res)
  })
  //req_log(req)
  //logics.put_if_data(req,res)
  
router.get(url_if_data_signal, function(req, res, next) {
  req_log(req)
    logics.get_signal_stream(req,res)
  })
router.put(url_if_data_reply, function(req, res, next) {
req_log(req)
  logics.put_reply(req,res)
})
  

module.exports = router;
