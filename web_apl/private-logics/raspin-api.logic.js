
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

 var pug =require("pug")



module.exports.SendControllMessage = function (pvid, message, args, timeout_second,res){
  var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
  
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  log("★★★send control start★★★:" + pvid)
  // Use connect method to connect to the server
  MongoClient.connect(url, function (err, db) {
      SendControllMessageMainLogic(db, pvid, message, args, timeout_second,res)
  })
}


function SendControllMessageMainLogic(db, pvid, message, args, timeout_second,res) {
    SendControllMessageCheckPv(db, pvid, message, args, timeout_second,res, 
        SendControllMessageWaitAcknowledge,
        SendControllMessageReturnModifyingMessage,
         SendControllMessageProcessControl,
          SendControllMessageProcessData
        )
}

function SendControllMessageCheckPv(db, pvid, message, args, timeout_second,res, scmWaitAcknowledge, scmReturnModifyingMessage,scmProcessControl, scmProcessData) {
    log("★★★connected★★★:" + pvid)
    
    var time_remain = 0
    if (timeout_second == 0) {
        time_remain = 120
    } else {
        time_remain = Math.min(timeout_second, 120);

    }
    var countdown = 1;
    db.collection("controller_provider").findOne({"_id":pvid}, {},function(err, dat) {
            scmWaitAcknowledge(db, pvid, message, args, timeout_second,res, dat,
                scmReturnModifyingMessage,scmProcessControl, scmProcessData) 
    });
  

}
function SendControllMessageWaitAcknowledge(db, pvid, message, args, timeout_second,res, dat, scmReturnModifyingMessage, scmProcessControl, scmProcessData) {
    ObId = require('mongodb').ObjectId
    var req_id = new ObId().toString()
    var target_queue = pvid + "_queue"
    var target_queue_accepted = pvid + "_accepted"

    log("★★★message inserted★★★:" + pvid)
    if (dat == null) {
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


module.exports.SubscribeControlMessage = function(pvid,previous_processed_req_id, timeout_second, res) {
  var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
  
  // Connection URL
  var url = 'mongodb://localhost:27017/test';
  
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    if (timeout_second == 0) {
        time_remain = 120
    } else {
        time_remain = Math.min(timeout_second, 120);

    }
    var countdown = 1;
    var target_queue = pvid + "_queue"

    var subscribing_proc = function(previous_processed_req_id) {
        log("###gt " + previous_processed_req_id)
        var await_cursor_src = db.collection(target_queue).find({_id:{ $gt: previous_processed_req_id }}, {tailable:true})
        var await_cursor = await_cursor_src.stream();
        await_cursor.on('data', function(got) {
            log("###accepted")
            log("###" + JSON.stringify({"req_id":got._id, "message":got["message"], "arg": got["arg"]}))
            res.writeHead(200, { 'Content-Type': 'application/json' });

            res.end(JSON.stringify({"req_id":got._id, "message":got["message"], "arg": got["arg"]}));
            await_cursor_src.close()
        });
        await_cursor.on('end', function() {
            db.close()

        });
    }

    if (previous_processed_req_id == "") {
        db.collection(target_queue).findOne({"init" : true},function(err, docs) {
            subscribing_proc(docs["_id"])

        });
        
    } else {
        subscribing_proc(previous_processed_req_id)

    }
  })
}

//以下,mongodbを移植予定の関数群
//コーディング完テスト未
module.exports.RegistControllerProvider = function(res,DataDesc) {
    init_vars()
    var check_input = _check_RegistControllerProvider(DataDesc)
    if (check_input) {
        return check_input
    }
    ObId = require('mongodb').ObjectId
    var pvid = new ObId().toString()
    DataDesc._id = pvid
    db.collection(controller_provider).insertOne(DataDesc)


    db.createCollection(pvid + "_queue",{ "capped": true,"size":  DataDesc["queue_size"],"max":  DataDesc["queue_size"] },
        function(err, collection) 
        {
            var tmpid = new ObId().toString()
            collection.insertOne({ "_id": tmpid, "init" : true } )
            db.createCollection( pvid + "_accepted", { capped: true, "size": Num_SIZE_OF_ACCEPTED } ,
            function(err,collection) {
                var tmpid = new ObId().toString()
                collection.insertOne({ "_id": tmpid, "init" : true } )
                res.send(JSON.stringify({"pvid": pvid}))

            })
        });
}


function init_vars() {
    Num_SIZE_OF_ACCEPTED = 25600
    Enum_DATA_TYPE = ["video","num","message"]
    DB_CONTROLLER_PV = db.controller_provider
    DB_DATA_PV = db.data_provider
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
