var express = require('express');
var router = express.Router();
var client = require('redis').createClient();

/* GET users listing. */


//client.flushall()
router.get('/', function(req, res, next) {
    //RegistControllerProviderMain(res, {"pvname": "con_1", "queue_size": 5000,"available_message": [{"message_name": "on1", "arg_count": 1}, {"message_name": "end2_service","arg_count": 1}]})
    //RegistDataProviderMain(res, {"pvname": "dat_2", "queue_size": 5000,"type":"num"})
    //AddOvservationDataMain(res, 1, 320)
    //GetObservationDataMain(res, [1],[""])
    AvailableDataProviderMain(res)
    log(":" + client.sismember("data_provider", 1, function(err, d) {
        log("@" + d)
    }))
});



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

var res_OK = JSON.stringify({"ret":"ok"})
var res_NG = JSON.stringify({"ret":"ng"})

 var pug =require("pug")

var client = require('redis').createClient();

//var MongoClient = require('mongodb').MongoClient
//, assert = require('assert');



function SendControllMessageMainLogic(db, pvid, message, args, timeout_second,res) {
    SendControllMessageCheckPv(db, pvid, message, args, timeout_second,res, 
        SendControllMessageWaitAcknowledge,
        SendControllMessageReturnModifyingMessage,
         SendControllMessageProcessControl,
          SendControllMessageProcessData
        )
}


function SendControllMessageCheckPv(db, pvid, message, args, timeout_second,res, scmWaitAcknowledge, scmReturnModifyingMessage,scmProcessControl, scmProcessData) {
    client.lindex("controller_provider").findOne({"_id":pvid}, {},function(err, dat) {
            scmWaitAcknowledge(err, db, pvid, message, args, timeout_second,res, dat,
                scmReturnModifyingMessage,scmProcessControl, scmProcessData) 
    });
  

}
function SendControllMessageWaitAcknowledge(err, db, pvid, message, args, timeout_second,res, dat, scmReturnModifyingMessage, scmProcessControl, scmProcessData) {
    ObId = require('mongodb').ObjectId
    var req_id = new ObId().toString()
    var target_queue = pvid + "_queue"
    var target_queue_accepted = pvid + "_accepted"

    log("★★★message inserted★★★:" + pvid)
    if (dat == null) {
        log(err)
        log("★★★not found in controller_privider★★★:" + pvid)
        res.writeHead(500, { 'Content-Type': 'application/json' });

        res.end(JSON.stringify({"ret":-1, "pvid":pvid}));
        db.close()
    }
    db.collection(target_queue).insertOne({"_id": req_id, "message":message, "arg":args, "init": false})
    var await_cursor_src = db.collection(target_queue_accepted).find({"_id":req_id}, {tailable:true,await_data:true});
    var await_cursor = await_cursor_src.stream();
    await_cursor_src.processed = 0
    await_cursor.on('data', function(ack_data) {
        log("★★★accepted★★★:" + pvid)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (ack_data.tag.ret =="1") {
            scmReturnModifyingMessage(db, pvid, message, args, timeout_second,res, ack_data, scmProcessControl, scmProcessData)
        } else {
            res.end(JSON.stringify({"ret":0, "tag":ack_data.tag}));
            db.close()
        }

    });
    await_cursor.on('end', function() {

    });
    
}
function SendControllMessageReturnModifyingMessage(db, pvid, message, args, timeout_second,res, ack_data,scmProcessControl, scmProcessData) {
    log("★★★create html★★★"+ack_data.tag.u)

    //更新対象のコントローラを検索し、更新を行う
    var ctrls = db.collection("controller_provider").find({"_id":{"$in":ack_data.tag.u}}).stream()
    var cpvid = []
    var ccontents = []
    
    ctrls.on("data",function(ctrl_data){
        scmProcessControl(db, pvid, message, args, timeout_second,res, ctrl_data, cpvid,ccontents)
    })
    ctrls.on("end",function(){
        log("★★★end end")

        //更新対象のデータプロバイダを検索し、更新を行う
        var datas = db.collection("data_provider").find({"_id":{"$in":ack_data.tag.u}}).stream()
        var dpvid = []
        var dcontents = []
        
        datas.on("data",function(data_data){
            scmProcessData(db, pvid, message, args, timeout_second,res,data_data, dpvid, dcontents)
        })
        datas.on("end",function(){
            //レスポンス返却
            log("★★★end end")
            var response_text = JSON.stringify({"restype":"modify","ctags":[cpvid,ccontents],"dtags":[dpvid,dcontents],"del":ack_data.tag.d})
            log(response_text)
            res.end(response_text)
            db.close()
        })
                
    })
}

function SendControllMessageProcessControl(db, pvid, message, args, timeout_second,res, control_data,ids,contents) {
    log("★★★got data★★★" + JSON.stringify(control_data))
    var amess=[]
    var acount=[]
    control_data.available_message.forEach(function(mess_rec){
            amess.push(mess_rec.message_name)
            acount.push(mess_rec.arg_count)
            })
    ids.push(control_data["_id"])
    var html_contents = pug.renderFile("./views/ui-controller-view.pug",{ pvid: control_data["_id"],pvname: control_data.pvname,available_message: amess,arg_count: acount})
    contents.push(html_contents)

}


function SendControllMessageProcessData(db, pvid, message, args, timeout_second,res,data_data, ids, contents) {
    log("★★★got data★★★" + JSON.stringify(data_data))
    
    ids.push(data_data["_id"])
    var html_contents = pug.renderFile("./views/ui-data-view.pug",{ pvid:data_data["_id"],pvname: data_data.pvname,type: data_data.type})
    contents.push(html_contents)

}

//以下,mongodbを移植予定の関数群
//コーディング完テスト未
function RegistControllerProviderMain(res,DataDesc) {
    init_vars()
    var check_input = _check_RegistControllerProvider(DataDesc)
    if (check_input) {
        return res.send(res_NG)
    }
    client.incr("id")
    client.get("id", function(err, val) {
        var pvid = val
        var tran = client.multi()
        console.log("id:" + pvid)

        //Controller_providerのデータを登録する
        tran.sadd(k_name(Key_Controller_Provider),  pvid)
        tran.hset(k_name(Key_Detail_Controller, pvid), "pvid",pvid)
        tran.hset(k_name(Key_Detail_Controller, pvid), "pvname",DataDesc.pvname)
        tran.hset(k_name(Key_Detail_Controller, pvid),"queue_size",DataDesc.queue_size)
        DataDesc.available_message.forEach(function(v) {
            tran.rpush(k_name(Key_Available_Message, pvid), v.message_name)
        })

        //キューは随時作られるからとくに何もする必要ナシ
        tran.exec(function(){
            res.send(res_OK)
        })
        

    })

}
function ModControllerProviderMain (res, pvid, DataDesc) {
    init_vars()
    var check_input = _check_RegistControllerProvider(DataDesc)
    if (check_input) {
        return res.send(res_NG)
    }
    var tran = client.multi()
    console.log("id:" + pvid)

    //Controller_providerのデータを登録する
    tran.hset(k_name(Key_Detail_Controller, pvid), "pvid",pvid)
    tran.hset(k_name(Key_Detail_Controller, pvid), "pvname",DataDesc.pvname)
    tran.hset(k_name(Key_Detail_Controller, pvid),"queue_size",DataDesc.queue_size)
    DataDesc.available_message.forEach(function(v) {
        tran.rpush(k_name(Key_Available_Message, pvid), v.message_name)
    })

    //キューは随時作られるからとくに何もする必要ナシ
    tran.exec(function(){
        res.send(res_OK)
    })

}
function RegistDataProviderMain (res, DataDesc) {
    init_vars()
    var check_input = _check_RegistDataProvider(DataDesc)
    if (check_input) {
        res.send(res_NG)
        return
    }

    client.incr("id")
    client.get("id", function(err, val) {
        var pvid = val
        var tran = client.multi()
        console.log("id:" + pvid)
        tran.sadd(k_name(Key_Data_Provider),  pvid)

        //Controller_providerのデータを登録する
        tran.hset(k_name(Key_Detail_Data, pvid), "pvname",DataDesc.pvname)
        tran.hset(k_name(Key_Detail_Data, pvid),"queue_size",DataDesc.queue_size)
        tran.hset(k_name(Key_Detail_Data, pvid),"type",DataDesc.type)

        tran.exec(function(){
            res.send(res_OK)
        })
        

    })

}

function AvailableDataProviderMain(res) {
    init_vars()
    var ret = []
    client.smembers(k_name(Key_Data_Provider), function(err, pvids) {
        if (pvids.length == 0) {
            res.send(res_NG)
            return
        }
        for (var i = 0 ; i < pvids.length; i++) {
            var pvid = pvids[i]
            var processed = 0
            client.hgetall(k_name(Key_Detail_Data,  pvid), function (err,dict) {
                ret.push({"pvid": dict["pvid"], "pvname": dict["pvname"], "type":dict["type"]})
                processed ++;
                if (processed == pvids.length) {
                    res.send(JSON.stringify(ret))
                }

            })

        }
        pvids.forEach(function (pvid) {
            
        })
    })

}

function AvailableControllerProviderMain(res) {
    init_vars()
    var ret = []
    client.smembers(k_name(Key_Controller_Provider), function(err, pvids) {
        if (pvids.length == 0) {
            res.send(res_NG)
            return
        }
        var response_cache_dict = {}
        var response_list = []
        for (var i = 0 ; i < pvids.length; i++) {
            var pvid = pvids[i]
            var processed = 0
            client.hgetall(k_name(Key_Detail_Controller, pvid), function (err,dict) {
                response_cache_dict[dict["pvid"]] = {"pvid": dict["pvid"], "pvname": dict["pvname"], "queue_size":dict["queue_size"]}
                client.lrange(k_name(Key_Available_Message, dict["pvid"]), 0, -1, function(err, mess_list) {
                    var rec = response_cache_dict[dict["pvid"]]
                    var av_mess_json = []
                    for (var j = 0; j < mess_list.length; j ++) {
                        av_mess_json.push({"message_name":mess_list[j]})
                    }
                    rec["available_message"] = av_mess_json
                    response_list.push(rec)
                    processed ++
                    if (processed >= pvids.length) {
                        res.send(JSON.stringify(response_list))
                    }

                })

            })

        }
    })
}
function k_name(desc, param) {
    if (desc == Key_Controller_Provider) {
        return "controller_provider"
    } else if (desc == Key_Data_Provider) {
        return "data_provider"
    } else if (desc == Key_Detail_Controller) {
       return "detail_con_" + param
    } else if (desc == Key_Available_Message) {
        return "av_mess_" + param
    } else if (desc == Key_Detail_Data) {
        return "detail_dat_" + param
    } else if (desc == Key_Data) {
        return "data_" + param
    } else if (desc == Key_Queue) {
        return "queue_" + param
    } else if (desc == Key_Accepted) {
        return "accepted_" + param
    } else if (desc == Key_Accepted_Detail) {
        return "accepted_detail" + param
    } else if (desc == Key_Data_Number) {
        return "data_number_seq"
    }
}
var Key_Controller_Provider = "cp"
var Key_Data_Provider = "dp"
var Key_Detail_Controller = "dc"
var Key_Detail_Data = "dd"
var Key_Available_Message = "am"
var Key_Data = "dt"
var Key_Queue = "qu"
var Key_Accepted = "ac"
var Key_Accepted_Detail = "ad"
var Key_Data_Number = "dn"

function DeleteProviderMain (res, id) {
    client.lrem(k_name(Key_Controller_Provider), id)
    client.lrem(k_name(Key_Data_Provider), id)
    client.del(k_name(Key_Detail_Controller, id))
    client.del(k_name(Key_Detail_Data, id))
    client.del(k_name(Key_Available_Message, id))
    client.del(k_name(Key_Data, id))
    client.del(k_name(Key_Queue, id))
    client.del(k_name(Key_Accepted, id))
    client.del(k_name(Key_Accepted_Detail, id))
    
}
function AcknowledgeMain(res, pvid, req_id, tag) {

}
function GetObservationDataMain(res, pvid_ary, previous_gotten_data_id_ary) {
    var ret = []
    var processed = 0
    for (var i = 0; i <  pvid_ary.length; i++) {
        var pvid = pvid_ary[i]
        var previous_gotten_data_id = previous_gotten_data_id_ary[i]
        
        if (previous_gotten_data_id == "") {
            previous_gotten_data_id = 0

        }
        client.zrangebyscore(k_name(Key_Data_Number,pvid), previous_gotten_data_id,Infinity, "withscores", function(err, val) {
            for (var j = 0; j < val.length; j += 2) {
                ret.push({"data_id" : val[j + 1], "data" : val[j], "pvid":this.args[0].substring("detail_dat_".length)})
            }
            processed ++
            if (processed >= pvid_ary.length) {
                res.send(JSON.stringify(ret))
            }
        })

    }
    
}
function AddOvservationDataMain(res, pvid, data) {
    client.incr(k_name(Key_Data_Number))
    client.get(k_name(Key_Data_Number), function(err, val) {
        client.zadd(k_name(Key_Data, pvid), val, data)
        res.send(res_OK)
    })
}

function init_vars() {
    Num_SIZE_OF_ACCEPTED = 25600
    Enum_DATA_TYPE = ["video","num","message"]
    Num_MAX_WAIT_CONTROL = 120

}

function _check_RegistControllerProvider(DataDesc) {
    init_vars()
    var check_pvname = _required_variable_check(DataDesc, "pvname")
    var check_type = _required_variable_check(DataDesc, "available_message")
    var check_queue_size = _required_variable_check(DataDesc, "queue_size")

    if (check_pvname) {
        return check_pvname
    }
    if (check_type) {
        return check_type
    }

    if (check_queue_size) {
        return check_queue_size
    }
    var check_type_is_array = _is_array_check(DataDesc, "available_message")
    if (check_type_is_array) {
         return check_type_is_array
    }

    for (var mess_idx = 0; mess_idx < DataDesc["available_message"].length; mess_idx ++) {
        var entry = DataDesc["available_message"][mess_idx]
        var check_message_name = _required_variable_check(entry, "message_name")
        var check_arg_count = _required_variable_check(entry, "arg_count")
        var check_arg_count_is_num = _is_number_check(entry, "arg_count")
        if (check_message_name) {
            return check_message_name
        }
        if (check_arg_count) {
            return check_arg_count
        }
        if (check_arg_count_is_num) {
            return check_arg_count_is_num
        }
    }
}
function _check_RegistDataProvider(DataDesc) {
    init_vars()
    var check_pvname = _required_variable_check(DataDesc, "pvname")
    var check_type = _required_variable_check(DataDesc, "type")
    var check_type_value = _is_in_check(DataDesc, "type", Enum_DATA_TYPE)
    var check_queue_size = _required_variable_check(DataDesc, "queue_size")
    var check_queue_size_value = _is_number_check(DataDesc, "queue_size")

    if (check_pvname) {
        return check_pvname
    }
    if (check_type) {
        return check_type
    }
    if (check_type_value) {
        return check_type_value
    }
    if (check_queue_size) {
        return check_queue_size
    }
    if (check_queue_size_value) {
        return check_queue_size_value
    }

}
function _required_variable_check(target, variable) {
    init_vars()
    if (!(variable in target)) {
        return _create_error(variable + "is not contained")
    } else {
        return null
    }

}
function _is_number_check(target, variable) {
    init_vars()
    if (variable in target && isNaN(target[variable])) {
        return _create_error(variable + "is not number")
    } else {
        return null
    }
}

function _is_in_check(target, variable, allowed_items) {
    init_vars()
    if (variable in target &&  allowed_items.indexOf(target[variable]) < 0) {
        return _create_error(variable + "is not allowed")
    } else {
        return null
    }
}

function _is_array_check(target, variable) {
    init_vars()
    if (variable in target && !Array.isArray(target[variable])) {
        return _create_error(variable + "is not array")
    } else {
        return null
    }
}
function _create_error(mess) {
    init_vars()
    return {error:mess}
}



module.exports = router;
