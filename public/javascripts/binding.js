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
    $.get(resource_path(id) + rule_kind, 
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
            url:resource_path(id) + "data",
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
            url:resource_path(id) + "data",
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
            url:resource_path(id) + "data",
            method:"PUT",
            data:{"data":"off"},
            async:false
        }
    )
}    
function button_down_arrow_handler(id,dir) {
    console.log("button_down")
    aplly_rules()
    $.ajax(
        {
            url:resource_path(id) + "data",
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
            url:resource_path(id) + "data",
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
}


// setInterval(observe_periodically, 1000)