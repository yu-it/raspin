//import { setTimeout } from "timers";
var timeout = 1000*60
var pug =require("pug")
var client = require('redis').createClient();
var redis_id_machines = "#list_of_machines";
var redis_key_machine_name = "machine_name";
var redis_key_machine_disp_name = "machine_disp_name";
var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter();
function redis_id_data_reply_id(id, ack_id) {
    return id + "/reply/" + ack_id
}    
function redis_id_data_listenercounter(id) {
    return "#" + id + "/listener"
}
function redis_id_data_ack_id_seq(id) {
    return "#" + id + "/ack_id_seq"
}
function redis_id_data_id_seq(id) {
    return "#" + id + "/ack_id_seq"
}


function isEmpty(str) {
    return str == undefined;
}

function isNumber(x){ 
    if( typeof(x) != 'number' && typeof(x) != 'string' )
        return false;
    else 
        return (x == parseFloat(x) && isFinite(x));
}
function sendJson(res, data, send404 ) {
    if (send404 == undefined) {
        send404 = true;
    }
    if (send404 && data == undefined) {
        res.writeHead(404);
        res.end();
    } else {
        res.send(JSON.stringify(data));

    }
}

function get_machines(req,res) {
    client.lrange(redis_id_machines, 0, -1, function (error, items) {
        sendJson(res,items);

    })
} 
module.exports.put_machine = put_machine
module.exports.check_resource = check_resource
module.exports.get_machines = get_machines
module.exports.get_machine = get_machine
module.exports.delete_machine = delete_machine
function check_resource(req,res, target, exists, not_exists) {
    log("check:" + target)
    client.exists(target, function(err, reply) {
        if (reply === 1) {
            log("n.e:" + target)
            exists(req,res)
        } else {
            log("e.:" + target)
            not_exists(req,res);
        }
    });
} 
function put_machine(req,res) {
    res.writeHead(201);
    var machine_disp_name = req.param("machine_disp_name")
    redis_disp_name = req.param("machine_disp_name")
    client.hmset(req.resource_id, 
        redis_key_machine_name, 
        req.resource_id,
        redis_key_machine_disp_name, 
        (isEmpty(machine_disp_name) ? req.resource_id : machine_disp_name));
    client.rpush(redis_id_machines,req.resource_id)
    res.end()
} 
function get_machine(req,res) {
    client.hgetall(req.resource_id, function(err, data) {
        sendJson(res,data);
    });
} 
function delete_machine(req,res) {
    client.del(req.resource_id, function (error, items) {
        client.lrem(redis_id_machines, 1, req.resource_id)
        res.writeHead(200);
        res.end();

    })
} 

//processes
var redis_id_processes = "#list_of_processes";
var redis_key_process_name = "process_name";
var redis_key_process_disp_name = "process_disp_name";
function get_processes(req,res) {
    client.lrange(redis_id_processes, 0, -1, function (error, items) {
        var retList = []
        var filter = "/machines/" + req.param("machine_name") + "/"
        for (var i = 0; i < items.length; i++) {
            if (items[i].indexOf(filter) == 0) {
                retList.push(items[i])
            }
        }
        sendJson(res,items);

    })
} 
module.exports.get_processes = get_processes

function emit_ui_event(req) {
    ev.emit("ui_receive_ch",
    JSON.stringify({
    "id": "/machines/" + req.param("machine_name") + "/signal",
    "target":req.resource_id,
    "event_type":req.method}))

}
//process
function put_process(req,res) {
    var process_disp_name = req.param("process_disp_name")
    client.hmset(req.resource_id, 
        redis_key_process_name, 
        req.resource_id,
        redis_key_process_disp_name, 
        (isEmpty(process_disp_name) ? req.resource_id : process_disp_name));
    client.rpush(redis_id_processes,req.resource_id)
    emit_ui_event(req)
    res.writeHead(201);
    res.end();
} 
module.exports.put_process = put_process
function get_process(req,res) {
    client.hgetall(req.resource_id, function(err, data) {
        sendJson(res,data);
    });
} 
module.exports.get_process = get_process
function del_process(req,res) {
    emit_ui_event(req)
    client.del(req.resource_id, function (error, items) {
        client.lrem(redis_id_processes, 1, req.resource_id)
        res.writeHead(200);
        res.end();

    })
} 
module.exports.del_process = del_process

var list_of_if = "#list_of_if";
var redis_key_if_numbers_name = "if_name";
var redis_key_if_numbers_disp_name = "if_disp_name";
var redis_key_if_kind = "if_kind";
var redis_key_number_unit = "unit";
var redis_key_number_scale = "scale";
var redis_key_arrows_enable = "enable";
var redis_key_button_on = "on";
var redis_key_button_off = "off";
function get_ifs(req,res) {
    client.lrange(list_of_if, 0, -1, function (error, items) {
        var retList = []
        var filter = "/machines/" + req.param("machine_name") + "/processes/"  + req.param("process_name") + "/"
        for (var i = 0; i < items.length; i++) {
            if (items[i].indexOf(filter) == 0) {
                retList.push(items[i])
            }
        }
        sendJson(res,retList);

    })
} 
module.exports.get_ifs = get_ifs
function put_if(req,res) {
    //リスナ数とデータ通番シーケンスを初期化してから
    client.set(redis_id_data_listenercounter(req.resource_id + "/data"),0, function() {
        client.set(redis_id_data_ack_id_seq(req.resource_id + "/data"),0, function() {
            client.set(redis_id_data_id_seq(req.resource_id + "/data"),0, function() {
                if (req.param("if_kind") == "if_numbers") {
                    put_if_num(req,res)
                } else if (req.param("if_kind") == "if_messages") {
                    put_if_message_log(req,res)
                }else if (req.param("if_kind") == "if_logs") {
                    put_if_message_log(req,res)
                }else if (req.param("if_kind") == "if_arrows") {
                    put_if_arrow(req,res)
                } else if (req.param("if_kind") == "if_toggles") {
                    put_if_toggle(req,res)
                } else if (req.param("if_kind") == "if_buttons") {
                    put_if_button(req,res)
                } else if (req.param("if_kind") == "if_videos") {
                    put_if_videos(req,res)
                } else {
                    res.writeHead("500")
                    res.write("kind is invalid")
                    res.end()
                }
                emit_ui_event(req)
            })   
        })
    })
}
function put_if_button(req,res) {
    var if_numbers_disp_name = req.param("if_disp_name")
    var on = isEmpty(req.param("on")) ? "on" : req.param("on")
    var off = isEmpty(req.param("off")) ? "off" : req.param("off")
    var if_kind = req.param("if_kind")
 client.hmset(req.resource_id, 
        redis_key_if_numbers_name, 
        req.resource_id,
        redis_key_if_numbers_disp_name, 
        (isEmpty(if_numbers_disp_name) ? req.resource_id : if_numbers_disp_name),
        redis_key_button_off, 
        off, 
        redis_key_button_on, 
        on, 
        redis_key_if_kind, 
        if_kind
    );
    client.rpush(list_of_if,req.resource_id)
    put_if_data_business(req.resource_id + "/data" ,"off")
    res.writeHead(201);
    res.end();
} 
function put_if_toggle(req,res) {
    var if_numbers_disp_name = req.param("if_disp_name")
    var status = req.param("status")
    var if_kind = req.param("if_kind")
    if (status == undefined || !Array.isArray(status)) {
        res.writeHead("500")
        res.write("status is required")
        res.end()
        return
    }
    client.hmset(req.resource_id, 
        redis_key_if_numbers_name, 
        req.resource_id,
        redis_key_if_numbers_disp_name, 
        (isEmpty(if_numbers_disp_name) ? req.resource_id : if_numbers_disp_name),
        redis_key_if_kind, 
        if_kind
    );
    status.forEach(function(item) {
        client.rpush(req.resource_id + "/status",item)
    })
    client.rpush(list_of_if,req.resource_id)
    put_if_data_business(req.resource_id + "/data" ,status[0])
    res.writeHead(201);
    res.end();
} 
function put_if_arrow(req,res) {
    var if_numbers_disp_name = req.param("if_disp_name")
    var enable = isEmpty(req.param("enable")) ? "trbl" : req.param("enable")
    var if_kind = req.param("if_kind")
    if (["trbl","lr","tb"].indexOf(enable) < 0) {
        res.writeHead("500")
        res.write("trbl,lr,tb is required")
        res.end()
        return
    }
    client.hmset(req.resource_id, 
        redis_key_if_numbers_name, 
        req.resource_id,
        redis_key_if_numbers_disp_name, 
        (isEmpty(if_numbers_disp_name) ? req.resource_id : if_numbers_disp_name),
        redis_key_arrows_enable, 
        enable,
        redis_key_if_kind, 
        if_kind
    );
    client.rpush(list_of_if,req.resource_id)
    res.writeHead(201);
    res.end();
} 
function put_if_num(req,res) {
    var if_numbers_disp_name = req.param("if_disp_name")
    var unit = isEmpty(req.param("unit")) ? "" : req.param("unit")
    var scale = isEmpty(req.param("scale")) ? 0 : req.param("scale")
    var if_kind = req.param("if_kind")
    if (!isNumber(scale)) {
        res.writeHead("500")
        res.end()
        return
    }
    client.hmset(req.resource_id, 
        redis_key_if_numbers_name, 
        req.resource_id,
        redis_key_if_numbers_disp_name, 
        (isEmpty(if_numbers_disp_name) ? req.resource_id : if_numbers_disp_name),
        redis_key_number_scale, 
        scale,
        redis_key_number_unit, 
        unit,
        redis_key_if_kind, 
        if_kind
    );
    client.rpush(list_of_if,req.resource_id)
    res.writeHead(201);
    res.end();
} 
function put_if_message_log(req,res) {
    var if_numbers_disp_name = req.param("if_disp_name")
    var if_kind = req.param("if_kind")
    client.hmset(req.resource_id, 
        redis_key_if_numbers_name, 
        req.resource_id,
        redis_key_if_numbers_disp_name, 
        (isEmpty(if_numbers_disp_name) ? req.resource_id : if_numbers_disp_name),
        redis_key_if_kind, 
        if_kind
    );
    client.rpush(list_of_if,req.resource_id)
    res.writeHead(201);
    res.end();
} 
var redis_key_if_videos_name = "if_name"
var redis_key_if_videos_disp_name = "if_disp_name";

function put_if_videos(req,res) {
    var if_videos_disp_name = req.param("if_disp_name")
    var if_kind = req.param("if_kind")
    client.hmset(req.resource_id, 
        redis_key_if_videos_name, 
        req.resource_id,
        redis_key_if_videos_disp_name, 
        (isEmpty(if_videos_disp_name) ? req.resource_id : if_videos_disp_name),
        redis_key_if_kind, 
        if_kind
    );
    client.rpush(list_of_if,req.resource_id)
    res.writeHead(201);
    res.end();
} 

module.exports.put_if = put_if
function get_if(req,res) {

    client.hgetall(req.resource_id, function(err, data) {
        if (data != undefined && req.param("if_kind") == "if_toggles") {
            client.lrange(req.resource_id + "/status", 0, -1, function (error, items) {
                data["status"] = items;
                sendJson(res,data);
        
            })
        
        } else {
            sendJson(res,data);
        }
});
} 
module.exports.get_if = get_if
function del_if(req,res) {
    emit_ui_event(req)
    client.del(req.resource_id, function (error, items) {
        client.lrem(list_of_if, 1, req.resource_id)
        client.del(redis_id_data_listenercounter(req.resource_id + "/data"), function() {
            client.del(redis_id_data_ack_id_seq(req.resource_id + "/data"), function() {
                client.del(redis_id_data_id_seq(req.resource_id + "/data"), function() {
                    client.del(req.resource_id + "/data", function() {
                        res.writeHead(200);
                        res.end();
                    })
                })
            })
        })
        
    })
} 
module.exports.del_if = del_if

function get_rules(req,res, local_resource_id) {
    client.lrange(local_resource_id, 0, -1, function (error, items) {
        if (items == undefined || items.length == 0) {
            res.writeHead(404);
            res.end();
        } else {
            sendJson(res,items);
        }
    })
} 
function put_rules(req,res, local_resource_id) {
    var status = "/" + req.param("0")
    client.rpush(local_resource_id, status)
    res.writeHead(200);
    res.end();
} 
function del_rules(req,res, local_resource_id) {
    var status = req.param("0")
    client.del(local_resource_id, function() {
        res.writeHead(200);
        res.end();
    
    })
} 
module.exports.get_rules = get_rules
module.exports.put_rules = put_rules
module.exports.del_rules = del_rules

module.exports.get_if_data = get_if_data
module.exports.put_if_data = put_if_data
function get_if_data(req,res) {
    var from = req.param("from")
    var to = req.param("to")
    if (from == undefined && to == undefined) {
        from = -1
        to = -1
    } else {
        if (from == undefined) {
            from = 0
        }
        if (to == undefined) {
            to = -1
        }
    }    
    client.lrange(req.resource_id, from, to, function (error, items) {
        if (items == undefined || items.length == 0) {
            res.writeHead(404);
            res.end();
        } else {
            sendJson(res,items);
        }
    })
} 

var reply_waiting_requests = {}
var signal_waiting_requests = {}
ev.on("reply_ch", accept_reply)
ev.on("receive_ch", accept_signal)
ev.on("ui_receive_ch", accept_ui_signal)
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
}

module.exports.put_reply = put_reply
function put_reply(req,res) {
    ev.emit("reply_ch",
    req.resource_id)
    res.writeHead(200)
    res.end()
}
var ui_signal_waiting_requests = {}
module.exports.get_ui_signal_stream = get_ui_signal_stream
function get_ui_signal_stream(req,res) {
    if(!ui_signal_waiting_requests[req.resource_id]) {
        ui_signal_waiting_requests[req.resource_id] = []
    }
    sse_response_initialize(res);
    ui_signal_waiting_requests[req.resource_id].push(res);
    res.on("close",function() {
        if (signal_waiting_requests[req.resource_id] == undefined) {
            return
        }
        for (var i = 0;i < signal_waiting_requests[req.resource_id].length; i++) {
            if (signal_waiting_requests[req.resource_id][i] == res) {
                signal_waiting_requests[req.resource_id].splice(i,1)
            }
        }
    })
}
module.exports.get_signal_stream = get_signal_stream
function get_signal_stream(req,res) {
    if(!signal_waiting_requests[req.resource_id]) {
        signal_waiting_requests[req.resource_id] = []
    }
    sse_response_initialize(res);
    signal_waiting_requests[req.resource_id].push(res);
    client.incr(redis_id_data_listenercounter(req.resource_id.replace("/signal","")))
    res.on("close",function() {
        client.decr(redis_id_data_listenercounter(req.resource_id.replace("/signal","")))
        for (var i = 0;i < signal_waiting_requests[req.resource_id].length; i++) {
            if (signal_waiting_requests[req.resource_id][i] == res) {
                signal_waiting_requests[req.resource_id].splice(i,1)
            }
        }
        
        
    })

}
function put_if_data(req,res) {
    //client.set("#" + req.resource_id + "/data/listener",0, function() {
    //client.set("#" + req.resource_id + "/data/ack_id_seq",0, function() {
    //client.set("#" + req.resource_id + "/data/data_id_seq",0, function() {
    client.get(redis_id_data_listenercounter(req.resource_id), function(err, listener_count) {
        var data = req.param("data")
        if (data == undefined) {
            res.writeHead(500);
            res.end();
            return;    
        }
        put_if_data_business(req.resource_id, data)
        if (listener_count == 0 || listener_count == undefined || listener_count == null) {
            res.writeHead(200);
            res.end();
            return;    
        }
        //同期処理
        client.incr(redis_id_data_ack_id_seq(req.resource_id), function(err, ack_id) {
            sse_response_initialize(res)
            var timeouted = false;
            res.timeouted = false;
            var reply_id = redis_id_data_reply_id(req.resource_id,ack_id);
            setTimeout(function() {
                log("timeout")
                if (!res._header) {
                    res.writeHead(408);
                    res.end();
                }
                res.timeouted = true;
                delete reply_waiting_requests[reply_id]
            }, timeout)
                //リプライ時の処理定義
            reply_waiting_requests[reply_id] = {"listener":listener_count, "response":res}
            //データの通知
            ev.emit("receive_ch",
                JSON.stringify({
                "destination": req.resource_id + "/signal",
                "reply_id":reply_id,
                "data":req.body["data"]}))
            })
            
        
    })
} 

function put_if_data_business(resource_id,data) {
    if (data != undefined) {
        client.rpush(resource_id, data)
    }
        
} 

function accept_signal(data) {
    log("accept_signal")
    var id = JSON.parse(data)["destination"]
    var signal_receiver_inf = signal_waiting_requests[id];
    if (signal_receiver_inf == undefined) {
        return
    }
    signal_receiver_inf.forEach(function(receiver) {
        receiver.write("event: signal\n")
        receiver.write("data: "+data + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n") //この2行の改行が重要。
        receiver.flush() 
        })
}
function accept_ui_signal(data) {
    log("accept_signal")
    
    var id = JSON.parse(data)["id"]
    var signal_receiver_inf = ui_signal_waiting_requests[id];
    if (signal_receiver_inf == undefined) {
        return
    }
    signal_receiver_inf.forEach(function(receiver) {
        receiver.write("event: signal\n\n")
        receiver.write("data: "+data + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n") //この2行の改行が重要。
        receiver.flush() 
        })
}
function accept_reply(id) {
    log("accept_reply")
    var reply_acceptor_inf = reply_waiting_requests[id];
    reply_acceptor_inf["listener"] --;
    if (reply_acceptor_inf["listener"] == 0) {
        if (!reply_acceptor_inf["response"].timeouted) {
            reply_acceptor_inf["response"].end();
            delete reply_waiting_requests[id]
            return;
        }
    }
}

function log(str){
	var d = new Date();
	var year  = d.getFullYear();
	var month = d.getMonth() + 1;
	var day   = d.getDate();
	var hour  = ( d.getHours()   < 10 ) ? '0' + d.getHours()   : d.getHours();
	var min   = ( d.getMinutes() < 10 ) ? '0' + d.getMinutes() : d.getMinutes();
	var sec   = ( d.getSeconds() < 10 ) ? '0' + d.getSeconds() : d.getSeconds();
	console.log( year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec + "  " + str );
}

client.flushall()

