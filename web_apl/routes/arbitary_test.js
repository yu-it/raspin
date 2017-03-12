var express = require('express');
var router = express.Router();
var client = require('redis').createClient();

/* GET users listing. */


//client.flushall()
router.get('/', function(req, res, next) {
    //RegistControllerProviderMain(res, {"pvname": "con_1", "queue_size": 5000,"available_message": [{"message_name": "on1", "arg_count": 1}, {"message_name": "end2_service","arg_count": 1}]})
    AvailableControllerProviderMain(res)
});


function AvailableControllerProviderMain(res) {
//    tran.hset("detail_con_" + pvid, "pvname",DataDesc.pvname)
//    tran.hset("detail_con_" + pvid,"queue_size",DataDesc.queue_size)
//    DataDesc.available_message.forEach(function(v) {
//        tran.rpush("av_mess_" + pvid, v.message_name)
//    })
    init_vars()
    var ret = []
    client.lrange("controller_provider", 0 ,-1, function(err, pvids) {
        if (pvids.length == 0) {
            res.send(res_NG)
            return
        }
        var response_cache_dict = {}
        var response_list = []
        for (var i = 0 ; i < pvids.length; i++) {
            var pvid = pvids[i]
            var processed = 0
            client.hgetall("detail_con_" + pvid, function (err,dict) {
                response_cache_dict[dict["pvid"]] = {"pvid": dict["pvid"], "pvname": dict["pvname"], "queue_size":dict["queue_size"]}
                client.lrange("av_mess_" + dict["pvid"], 0, -1, function(err, mess_list) {
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


function AvailableDataProviderMain(res) {
    init_vars()
    var ret = []
    client.lrange("data_provider", 0 ,-1, function(err, pvids) {
        if (pvids.length == 0) {
            res.send(res_NG)
            return
        }
        for (var i = 0 ; i < pvids.length; i++) {
            var pvid = pvids[i]
            var processed = 0
            client.hgetall("detail_dat_" + pvid, function (err,dict) {
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

var res_OK = JSON.stringify({"ret":"ok"})
var res_NG = JSON.stringify({"ret":"ng"})

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
        tran.rpush("data_provider",  pvid)

        //Controller_providerのデータを登録する
        tran.hset("detail_dat_" + pvid, "pvid",pvid)
        tran.hset("detail_dat_" + pvid, "pvname",DataDesc.pvname)
        tran.hset("detail_dat_" + pvid,"queue_size",DataDesc.queue_size)
        tran.hset("detail_dat_" + pvid,"type",DataDesc.type)

        tran.exec(function(){
            res.send(res_OK)
        })
        

    })

}


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
        tran.rpush("controller_provider",  pvid)
        tran.hset("detail_con_" + pvid, "pvid",pvid)
        tran.hset("detail_con_" + pvid, "pvname",DataDesc.pvname)
        tran.hset("detail_con_" + pvid,"queue_size",DataDesc.queue_size)
        DataDesc.available_message.forEach(function(v) {
            tran.rpush("av_mess_" + pvid, v.message_name)
        })

        //キューは随時作られるからとくに何もする必要ナシ
        tran.exec(function(){
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


module.exports = router;
