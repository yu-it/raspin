//スクリプト
//db.system.jsはpymongoならばsystem_js.関数名で呼び出せる
//shellではdb.loadServerScripts()で呼び出せるようになる
db.dropDatabase()
db.system.js.save({"_id":"init_vars", value:function() {
    Num_SIZE_OF_ACCEPTED = 25600
    Enum_DATA_TYPE = ["video","num","message"]
    DB_CONTROLLER_PV = db.controller_provider
    DB_DATA_PV = db.data_provider
    Num_MAX_WAIT_CONTROL = 120
}
})
//OK
db.system.js.save({"_id":"RegistControllerProvider", value:function(DataDesc) {
    init_vars()
    var check_input = _check_RegistControllerProvider(DataDesc)
    if (check_input) {
        return check_input
    }
    var pvid = ObjectId().str
    DataDesc._id = pvid
    DB_CONTROLLER_PV.insert(DataDesc)
    db.createCollection( pvid + "_queue", { capped: true, size: DataDesc["queue_size"] } )

    var tmpid = ObjectId().str
    db[pvid + "_queue"].insert({ "_id": tmpid, "init" : true } )
    db.createCollection( pvid + "_accepted", { capped: true, size: Num_SIZE_OF_ACCEPTED } )
    var tmpid = ObjectId().str
    db[pvid + "_accepted"].insert({ "_id": tmpid, "init" : true } )
    return pvid

}
})
db.system.js.save({"_id":"ModControllerProvider", value:function(pvid, DataDesc) {
    init_vars()

    DB_CONTROLLER_PV.remove({"_id": pvid})
    

    //以下、IDを採番しない以外はRegistと同じ
    var check_input = _check_RegistControllerProvider(DataDesc)
    if (check_input) {
        return check_input
    }

    DataDesc._id = pvid
    DB_CONTROLLER_PV.insert(DataDesc)
    
    return pvid

}
})

//サイズはバイト数
db.system.js.save({"_id":"RegistDataProvider", value:function(DataDesc) {
    init_vars()
    var check_input = _check_RegistDataProvider(DataDesc)
    if (check_input) {
        return check_input
    }

    var pvid = ObjectId().str
    DataDesc._id = pvid
    DB_DATA_PV.insert(DataDesc)
    db.createCollection( pvid + "_data", { capped: true, size: DataDesc["queue_size"] } )
    
    var tmpid = ObjectId().str
    db[pvid + "_data"].insert({ "_id":tmpid,  "init" : true } )
    return pvid
}
})

db.system.js.save({"_id":"AvailableDataProvider", value:function() {
    init_vars()
    var ret = []
    DB_DATA_PV.find().forEach(function(rec) {
        ret.push({"pvid": rec._id, "pvname": rec["pvname"], "type":rec["type"]})
    }
    )
    return ret
}
})
db.system.js.save({"_id":"AvailableControllerProvider", value:function() {
    init_vars()
    var ret = []
    DB_CONTROLLER_PV.find().forEach(function(rec) {
        ret.push({"pvid": rec._id, "pvname": rec["pvname"], "available_message": rec["available_message"]})
    }
    )
    return ret
}
})

db.system.js.save({"_id":"DeleteProvider", value:function(id) {
    init_vars()
    var removed = DB_CONTROLLER_PV.remove({"_id": id}).nRemoved
     if (removed > 0) {
         db[id + "_queue"].drop()
         //db[id + "_accepted"].drop()
         return removed
     }
     removed = DB_DATA_PV.remove({"_id": id}).nRemoved
     if (removed > 0) {
         db[id + "_data"].drop()
         return removed
     }
     return 0

}
})

db.system.js.save({"_id":"SendToController", value:function(pvid, message, args, timeout_second) {
    init_vars()
    var req_id = ObjectId().str
    var target_queue = pvid + "_queue"
    var target_queue_accepted = pvid + "_accepted"
    db[target_queue].insert({"_id": req_id, "message":message, "arg":args, "init": false})
    log(target_queue + " inserted (" + req_id + ")")
    
    //var time_remain = timeout_second;
    //var countdown = timeout_second ? 1 : 0;
    var time_remain = 0
    if (timeout_second == 0) {
        time_remain = Num_MAX_WAIT_CONTROL
    } else {
        time_remain = Math.min(timeout_second, Num_MAX_WAIT_CONTROL);

    }
    var countdown = 1;
    var await_cursor = db[target_queue_accepted].find({_id:req_id});
    await_cursor.addOption(DBQuery.Option.tailable)
    await_cursor.addOption(DBQuery.Option.awaitData)
    while (time_remain) {
    
        if ( await_cursor.hasNext()) {
            return 0
        }
        log("remaining time " + time_remain)

        time_remain -= countdown
    }
    return 1

}
})
db.system.js.save({"_id":"SubscribeControlMessage", value:function(pvid,previous_processed_req_id, timeout_second) {
    init_vars()
    //var time_remain = timeout_second;
    //var countdown = timeout_second ? 1 : 0;
    if (timeout_second == 0) {
        time_remain = Num_MAX_WAIT_CONTROL
    } else {
        time_remain = Math.min(timeout_second, Num_MAX_WAIT_CONTROL);

    }
    var countdown = 1;
    var target_queue = pvid + "_queue"
    log(target_queue)
    if (previous_processed_req_id == "") {
        previous_processed_req_id = db[target_queue].findOne({"init" : true})["_id"]
    }
    log("gt " + previous_processed_req_id)
    var await_cursor = db[target_queue].find({_id:{ $gt: previous_processed_req_id }})
    await_cursor.addOption(DBQuery.Option.tailable)
    await_cursor.addOption(DBQuery.Option.awaitData)
    while (time_remain) {
        log("time_remaining " + time_remain)
        if ( await_cursor.hasNext()) {
            log("accepted")
            var got = await_cursor.next()
            return {"req_id":got._id, "message":got["message"], "arg": got["arg"]}
        }

        time_remain -= countdown
    }
    return null

}
})

db.system.js.save({"_id":"Acknowledge", value:function(pvid, req_id, tag) {
    init_vars()
    var target_queue_accepted = pvid + "_accepted"
    db[target_queue_accepted].insert({"_id": req_id, "tag": tag})
}
})

db.system.js.save({"_id":"GetOvservationData", value:function(pvid_ary, previous_gotten_data_id_ary) {
    init_vars()
    print(pvid_ary)
    print(previous_gotten_data_id_ary)
    var ret = []
    for (var i = 0; i <  pvid_ary.length; i++) {
        var pvid = pvid_ary[i]
        var previous_gotten_data_id = previous_gotten_data_id_ary[i]
        
        var target_data = pvid + "_data"
        if (previous_gotten_data_id == "") {
            previous_gotten_data_id = db[target_data].findOne()["_id"]

        }
        db[target_data].find({"_id": {$gt : previous_gotten_data_id}}).forEach(function (rec) {
            ret.push({"data_id" : rec["_id"], "data" : rec["data"], "pvid":pvid})
        })

    }
    return ret
}
})
db.system.js.save({"_id":"AddOvservationData", value:function(pvid, data) {
    init_vars()
    var target_data = pvid + "_data"
    var data_id = ObjectId().str

    db[target_data].insert({"_id": data_id, "data" : data})
    return 0
}
})

db.system.js.save({"_id":"_check_RegistControllerProvider", value:function(DataDesc) {
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
})

db.system.js.save({"_id":"_check_RegistDataProvider", value:function(DataDesc) {
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
})
db.system.js.save({"_id":"_required_variable_check", value:function(target, variable) {
    init_vars()
    if (!(variable in target)) {
        return _create_error(variable + "is not contained")
    } else {
        return null
    }
    
}
})
db.system.js.save({"_id":"_is_number_check", value:function(target, variable) {
    init_vars()
    if (variable in target && isNaN(target[variable])) {
        return _create_error(variable + "is not number")
    } else {
        return null
    }
    
}
})
db.system.js.save({"_id":"_is_in_check", value:function(target, variable, allowed_items) {
    init_vars()
    if (variable in target &&  allowed_items.indexOf(target[variable]) < 0) {
        return _create_error(variable + "is not allowed")
    } else {
        return null
    }
    
}
})
db.system.js.save({"_id":"_is_array_check", value:function(target, variable) {
    init_vars()
    if (variable in target && !Array.isArray(target[variable])) {
        return _create_error(variable + "is not array")
    } else {
        return null
    }
    
}
})
db.system.js.save({"_id":"_create_error", value:function(mess) {
    init_vars()
    return {error:mess}
}
})

db.system.js.save({"_id":"log", value:function(mess) {
    init_vars()
    print(mess)
}
})
