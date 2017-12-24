function escapeSelectorString(val){
    return val.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, "\\$&");
  }
function resource_path(resource_name) {
    return ("/raspin/internal/" + resource_name).replace("//", "/")
}
function hidden(name, val) {
    if (val == undefined) {
        return params[name]
    } else {
        params[name] = val
    } 
}
function common_dialog(message,arg_buttons) {
    var dialog = $('<div id="dialog" title=""><p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>' + message + '</p>')
    dialog.dialog({
        modal: true,
        show: "fade",
        buttons: arg_buttons
    })
}
function common_selector(message,options,arg_buttons) {
    var tag = '<div><ol id="selectable">'
    options.forEach(function(item) {
        tag += '<li class="ui-widget-content">' + item + '</li>'
    })
    tag += '</ol></div>'
    $("#dialog_space").append(tag)
    
    $("#selectable").selectable({
        selected: function( event, ui ) {
            // 選択された要素の値を取得
            console.log(ui.selected.innerText)
            hidden("sel_val",ui.selected.innerText)
        }        
    })

    $("#selectable").dialog({
        modal: true,
        show: "fade",
        buttons: arg_buttons
    })
}

function select_machine() {
    $.get(resource_path("machines"), function(machines) {
        machines = JSON.parse(machines)
        if (machines == undefined || machines.length == 0) {
            common_dialog("選択できるマシンがありません。",{"再読み込み":function(){ $( this ).dialog( "close" );select_machine();}})

        } else if (machines == undefined || machines.length == 1) {
            hidden("machine",machines[0]);
            load_machine();

        } else {
            common_selector("aaa",machines,{"決定":function(){ $( this ).dialog( "close" );hidden("machine",hidden("sel_val"));load_machine();}})
        }
    })
}
function load_machine() {
    hidden("machine_base", "/raspin/internal" + hidden("machine"))
    init_ui_sse_receiver()
    $.get(hidden("machine_base") + "/processes", function(processes) {
        processes = JSON.parse(processes)
        if (processes == undefined || processes.length == 0) {
            //common_dialog("選択できるマシンがありません。",{"再読み込み":function(){ $( this ).dialog( "close" );select_machine();}})
            return;
        }
        processes.forEach(function(process) {
            append_process(process)    
        })
    })
}
function delete_process(process) {
    $(id2JQId(process)).remove()
}
function append_process(process) {
    $("#main").append('<div class="' + process + '" style="background-color:#CCCCC;"/>')
    $.get(resource_path(process), function(process_data) {
        process_data = JSON.parse(process_data)
        $.get("/raspin/ui/process/?process_name=" + process_data["process_name"] + "&disp_name=" + process_data["process_disp_name"], function(html_doc) {
            $(id2JQCls(process)).replaceWith(html_doc)
        })
            
    })

}

$(
function () {
    var machine = select_machine();
}
)