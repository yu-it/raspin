function init_ui_sse_receiver() {
    var es = new EventSource('/raspin/internal' + hidden("machine") + "/signal");
    
    es.onmessage = function(event) {
        ui_event_queue.push(event)
        process_ui_event()      //リアルタイム性を向上させるにはこちら、リソース抑えるならsetintervalのイベント
    };
    
}
var ui_event_queue = []
var params = {}
var observe = []
var disable_rules = {}
var hiding_rules = {}
var binding_toggle_status_info = {}

function aplly_rules() {

}
function id2JQId(id) {
    return "#" + escapeSelectorString(id)
}
function id2JQCls(id) {
    return "." + escapeSelectorString(id)
}
function add_rule(id, rule_kind) {
    $.get((resource_path(id) + "/" + rule_kind).replace("//","/"), 
    function(rules) {
        var rules = JSON.parse(rules)
        if (rules != undefined && rules.length != 0) {
            rules.forEach(function(rule) {
                    if (!hiding_rules[rule]) {
                        hiding_rules[rule] = []
                    }
                    hiding_rules[rule].push(id)
                })
            }
    })
    
}
function toggle_handler(id) {
    var current = $(id2JQId(id+"/data")).text()
    var next = ""
    var status = binding_toggle_status_info[id]
    var idx = status.indexOf(current)
    if (idx == status.length - 1) {
        next = status[0]
    } else {
        next = status[idx + 1]
    }
    $(id2JQId(id+"/data")).text(next)
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id + "/data"),
            method:"PUT",
            data:{"data":next},
            async:false
        }
    )

}

function button_down_handler(id) {
    console.log("button_down")
    $(id2JQId(id+"/data")).text(binding_toggle_status_info[id]["on"])
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id + "/data"),
            method:"PUT",
            data:{"data":"on"},
            async:false
        }
    )

}    
function button_up_handler(id) {
    console.log("button_down")
    $(id2JQId(id+"/data")).text(binding_toggle_status_info[id]["off"])
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id + "/data"),
            method:"PUT",
            data:{"data":"off"},
            async:false
        }
    )
}    
function button_down_arrow_handler(id,dir) {
    console.log("button_down : " + id + " : " + dir)
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id + "/data"),
            method:"PUT",
            data:{"data":dir},
            async:false
        }
    )
}    
function button_up_arrow_handler(id,dir) {
    console.log("button_down")
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id + "/data"),
            method:"PUT",
            data:{"data":""},
            async:false
        }
    )
}    

function bindProcess(id) {
    add_rule(id,"hiding_rules")
    add_rule(id,"disable_rules")
    
}
function bindMachine(id) {
    add_rule(id,"hiding_rules")
    add_rule(id,"disable_rules")
    
}

function bindIf(if_data) {
    var id = if_data["if_name"]
    add_rule(id,"hiding_rules")
    add_rule(id,"disable_rules")
    if (if_data["if_kind"] == "if_numbers") {
        observe.push(id)
    } else if (if_data["if_kind"] == "if_arrows") {
    } else if (if_data["if_kind"] == "if_toggles") {
        binding_toggle_status_info[if_data["if_name"]] = if_data["status"]
    } else if (if_data["if_kind"] == "if_buttons") {
        binding_toggle_status_info[if_data["if_name"]] = {"on":if_data["on"], "off":if_data["off"]}
    }
        
}

function observe_periodically() {
    console.log("--periodical process")
    observe.forEach(function(id) {
        if (id == undefined || id == "") {
            console.log("empty")
            return
        }
        console.log(id)
        $.get(resource_path(id) + "/data", function(data) {
            console.log(data)
            data = JSON.parse(data)
            $(id2JQId(id + "/data")).text(data[0])
        })
    })
    process_ui_event()
}
function process_ui_event() {
    while (ui_event_queue.length > 0) {
        console.log("ui:" + ui_event_queue[ui_event_queue.length - 1])
        var event = JSON.parse(ui_event_queue.shift()["data"])
        var target = event["target"]
        if (target.split("/").length == 5) {
            //process event
            if (event["event_type"] == "PUT") {
                append_process(target)
            }
            if (event["event_type"] == "DELETE") {
                delete_process(target)
                
            }
        }
        if (target.split("/").length == 7) {
            var ary = target.split("/")
            var process = ""
            for (var i = 1; i < 5; i++) {
                process += "/" + ary[i]
            }
        
            if (event["event_type"] == "PUT") {
                append_if(process, target)
                
            }
            if (event["event_type"] == "DELETE") {
                delete_if(target)
                
            }
        }
    }
    
}

setInterval(observe_periodically, 3000)