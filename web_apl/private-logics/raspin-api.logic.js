var pug =require("pug")

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
var res_TIMEOUT = JSON.stringify({"ret":"to"})
var Timeout_limit = 10000


var client = require('redis').createClient();
var client_for_publish = require('redis').createClient();
var client_for_subscribe_queue = require('redis').createClient();
var client_for_subscribe_accepted = require('redis').createClient();
client.flushall()
client_for_subscribe_queue.psubscribe("queue_*")
client_for_subscribe_accepted.psubscribe("accepted_*")

var response_queue = {}
var response_accepted = {}
client_for_subscribe_queue.on("pmessage",function(pattern, channel, mess) {
	var pvid = channel.substring(channel.indexOf("_") + 1)
	if (response_queue[pvid]) {
		//I want to detect timeout...
		response_queue[pvid].send(mess)	
		response_queue[pvid] = null
		
	} else {
var publisher = getPublisher()
 publisher.publish(k_name(Key_Accepted, mess.req_id), JSON.stringify(res_NG))
   }
})


client_for_subscribe_accepted.on("pmessage",function(pattern, channel, ret) {
	var req_id = channel.substring(channel.indexOf("_") + 1)
	var res = response_accepted[req_id]
	if (response_accepted[req_id]) {
    	//I want to detect timeout...
		SendControllMessageAfterAcknowledged(res,req_id, ret)
        response_accepted[req_id] = null
	}
})


//client.flushall()

function getPublisher() {
    return client_for_publish
}

function SendControllMessageMain(res, pvid, message, args) {
    client.hexists("controller_provider", pvid, function(err, is_exist) {
        if (is_exist == 0) {
            res.send(res_NG)
            return
        }
        //reqest識別用一意キーの取得
        client.incr("id")
        client.get("id", function(err, req_id) {
            //request情報書き込み
            getPublisher().publish(k_name(Key_Queue, pvid), JSON.stringify({"req_id":req_id, "message":message, "arg": args}))
            log("★★★message inserted★★★:" + pvid + "/" + req_id+ ":" + k_name(Key_Queue, pvid))
    	    response_accepted[req_id] = res
         setTimeout(function(){
           if (response_accepted[req_id]) {
             response_accepted[req_id].send(res_TIMEOUT)
             response_accepted[req_id] = null
           
             log("send control timeout");
           }
         },Timeout_limit);
        })
    })
}
function SendControllMessageAfterAcknowledged(res, req_id, ret) {
	/////以下、リクエスト受理確認後の処理
	log("★★★accepted★★★:" + req_id)
	res.writeHead(200, { 'Content-Type': 'application/json' });
	var ack_data = JSON.parse(ret)  //JSON文字列で通知が来ることを想定
   if (ack_data == res_NG) {
      res.send(res_NG)
      return
   }

	if (ack_data.tag.ret =="1") {
	    client.hmget(k_name(Key_All_Provider), ack_data.tag.u, function (err, datas) {
		var contents = SendControllMessageCreateResponseData(ack_data.tag.u, datas)
		var response_text = JSON.stringify({"restype":"modify",
		    "ctags":[contents["cpvid"],contents["chtml"]],
		    "dtags":[contents["dpvid"],contents["dhtml"]],
		    "del":ack_data.tag.d})
            log(response_text)
		res.end(response_text)
	    })
	} else {
	    res.end(JSON.stringify({"ret":0, "tag":ack_data.tag}));

	}

}

function SendControllMessageCreateResponseData(pvids, jsons) {
    var response_dict = {"cpvid":[], "chtml":[], "dpvid":[], "dhtml":[]}
    for (var update_idx = 0; update_idx < pvids.length; update_idx ++) {
        var u_pvid =pvids[update_idx]
        var json_data = JSON.parse(jsons[update_idx])
        if (json_data == undefined || !("ptype" in json_data)) {
            continue
        }

        if (json_data["ptype"] == "c") {
            var amess = []
            var acount  = []
            json_data.available_message.forEach(function(mess_rec){
                    amess.push(mess_rec.message_name)
                    acount.push(mess_rec.arg_count)
            })
            var html_contents = pug.renderFile("./views/ui-controller-view.pug",{ pvid: u_pvid,pvname: json_data.pvname,available_message: amess,arg_count: acount})
            response_dict["chtml"].push(html_contents)
            response_dict["cpvid"].push(u_pvid)

        } else {
            var html_contents = pug.renderFile("./views/ui-data-view.pug",{ pvid:u_pvid,pvname: json_data.pvname,type: json_data.type})
            response_dict["dhtml"].push(html_contents)
            response_dict["dpvid"].push(u_pvid)

        }
    }
    return response_dict

}

function SubscribeControlMessage(res,pvid) {
	response_queue[pvid] = res
   setTimeout(function(){
     if (response_queue[pvid] {
       response_queue[pvid].send(res_TIMEOUT)
       response_queue[pvid] = null
           
       log("sbscribe timeout");
     }
    },Timeout_limit);
   
}

function AcknowledgeMain(res, pvid, req_id, tag) {
    var publisher = getPublisher()
    publisher.publish(k_name(Key_Accepted, req_id), JSON.stringify(tag))
    res.send(res_OK)

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
        DataDesc["pvid"] = pvid
        DataDesc["ptype"] = "c"

        //Controller_providerのデータを登録する
        tran.hset(k_name(Key_Controller_Provider),  pvid, JSON.stringify(DataDesc))
        tran.hset(k_name(Key_All_Provider),  pvid, JSON.stringify(DataDesc))

        //キューは随時作られるからとくに何もする必要ナシ
        tran.exec(function(){
            res.send(JSON.stringify({"pvid":pvid}))
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
    DataDesc["pvid"] = pvid
    DataDesc["ptype"] = "c"
    //Controller_providerのデータを登録する
    tran.hset(k_name(Key_Controller_Provider),  pvid, JSON.stringify(DataDesc))
    tran.hset(k_name(Key_All_Provider),  pvid, JSON.stringify(DataDesc))

    //キューは随時作られるからとくに何もする必要ナシ
    tran.exec(function(){
        res.send(JSON.stringify({"pvid":pvid}))
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
        DataDesc["pvid"] = pvid
        DataDesc["ptype"] = "d"
        console.log("id:" + pvid)
        tran.hset(k_name(Key_Data_Provider),  pvid, JSON.stringify(DataDesc))
        tran.hset(k_name(Key_All_Provider),  pvid, JSON.stringify(DataDesc))

        tran.exec(function(){
            res.send(JSON.stringify({"pvid":pvid}))
        })
        

    })

}

function AvailableDataProviderMain(res) {
    init_vars()
    var ret = []

    res.writeHead(200, { 'Content-Type': 'application/json' });
    client.hgetall(k_name(Key_Data_Provider), function (err, datas) {
        if (datas == undefined) {
            res.end(JSON.stringify([]))
            return
        }
        var data_array = []
        for (var k in datas) {
            data_array.push(JSON.parse(datas[k]))

        }
        res.end(JSON.stringify(data_array))
    })
}

function AvailableControllerProviderMain(res) {
    init_vars()
    var ret = []
    res.writeHead(200, { 'Content-Type': 'application/json' });
    client.hgetall(k_name(Key_Controller_Provider),  function(err, datas) {
        var data_array = []
        for (var k in datas) {
            data_array.push(JSON.parse(datas[k]))

        }
        res.end(JSON.stringify(data_array))
    })
}
function k_name(desc, param) {
    if (desc == Key_Controller_Provider) {
        return "controller_provider"
    } else if (desc == Key_Data_Provider) {
        return "data_provider"
    } else if (desc == Key_All_Provider) {
        return "all_provider"
    } else if (desc == Key_Data) {
        return "data_" + param
    } else if (desc == Key_Queue) {
        return "queue_" + param
    } else if (desc == Key_Accepted) {
        return "accepted_" + param
    } else if (desc == Key_Data_Number) {
        return "data_number_seq"
    }
}
var Key_All_Provider = "ap"
var Key_Controller_Provider = "cp"
var Key_Data_Provider = "dp"
var Key_Data = "dt"
var Key_Queue = "qu"
var Key_Accepted = "ac"
var Key_Data_Number = "dn"

function DeleteProviderMain (res, id) {
    client.hdel(k_name(Key_Controller_Provider), id)
    client.hdel(k_name(Key_Data_Provider), id)
    client.hdel(k_name(Key_All_Provider), id)
    client.del(k_name(Key_Data, id))
    client.del(k_name(Key_Queue, id))
    client.del(k_name(Key_Accepted, id))
    res.send(res_OK)
    
}
function GetObservationDataMain(res, pvid_ary, previous_gotten_data_id_ary) {
    var ret = []
    var processed = 0
    res.writeHead(200, { 'Content-Type': 'application/json' });
    for (var i = 0; i <  pvid_ary.length; i++) {
        var pvid = pvid_ary[i]
        var previous_gotten_data_id = previous_gotten_data_id_ary[i]
        
        if (previous_gotten_data_id == "") {
            previous_gotten_data_id = 0

        }
        client.zrangebyscore(k_name(Key_Data,pvid), previous_gotten_data_id,Infinity, "withscores", function(err, val) {
            if (val == undefined) {
                processed ++
                return
            }
            for (var j = 0; j < val.length; j += 2) {
                ret.push({"data_id" : val[j + 1], "data" : val[j].substring(val[j].indexOf("-") + 1), "pvid":this.args[0].substring("data_".length)})
            }
            processed ++
            if (processed >= pvid_ary.length) {
                res.end(JSON.stringify(ret))
            }
        })

    }
    
}
function AddOvservationDataMain(res, pvid, data) {
    client.hexists("data_provider", pvid, function(err, is_exist) {
        if (is_exist == 0) {
            res.send(res_NG)
            return
        }

        client.incr(k_name(Key_Data_Number))
        client.get(k_name(Key_Data_Number), function(err, val) {
            client.zadd(k_name(Key_Data, pvid), val, val + "-" + data)
            res.send(res_OK)
        })
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


module.exports.SendControllMessage = SendControllMessageMain                    //
module.exports.SubscribeControlMessage = SubscribeControlMessage                //
module.exports.RegistControllerProvider = RegistControllerProviderMain          //
module.exports.ModControllerProvider= ModControllerProviderMain                 //
module.exports.RegistDataProvider= RegistDataProviderMain                       //
module.exports.AvailableDataProvider= AvailableDataProviderMain                 //
module.exports.AvailableControllerProvider = AvailableControllerProviderMain    //
module.exports.DeleteProvider= DeleteProviderMain                               //
module.exports.Acknowledge= AcknowledgeMain                                     //
module.exports.GetOvservationData= GetObservationDataMain                       //
module.exports.AddOvservationData = AddOvservationDataMain                      //
