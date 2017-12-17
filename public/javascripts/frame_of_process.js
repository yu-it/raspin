function setup_process(process_name,disp_name) {
    console.log("target_process:" + resource_path(process_name) + "/ifs")
    $.get(resource_path(process_name) + "/ifs", function(ifs) {
        var ifs = JSON.parse(ifs)
        if (ifs == undefined || ifs.length == 0) {
            //common_dialog("選択できるマシンがありません。",{"再読み込み":function(){ $( this ).dialog( "close" );select_machine();}})
            return;
        }
        ifs.forEach(function(iface) {
            console.log("url:" + resource_path(process_name) + "/ifs" + ", iface:" + iface)
            $.get(resource_path(iface), function(if_data) {
                //alert(if_data)
                console.log(if_data)
                if_data = JSON.parse(if_data)
                $.get("/raspin/ui/" + if_data["if_kind"] + "?if_name=" + if_data["if_name"] + "&disp_name=" + if_data["if_disp_name"] + "&unit=" + if_data["unit"], 
                function(html_doc) {
                    var a = $("#" + escapeSelectorString(process_name)).append(html_doc)
                })
                    
            })
    
        })
    })
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
            
        } else {
            common_selector("aaa",machines,{"決定":function(){ $( this ).dialog( "close" );hidden("machine",hidden("sel_val"));load_machine();}})
        }
    })
}
function load_machine() {
    hidden("machine_base", "/raspin/internal" + hidden("machine"))
    $.get(hidden("machine_base") + "/processes", function(processes) {
        processes = JSON.parse(processes)
        if (processes == undefined || processes.length == 0) {
            //common_dialog("選択できるマシンがありません。",{"再読み込み":function(){ $( this ).dialog( "close" );select_machine();}})
            return;
        }
        processes.forEach(function(process) {
            $.get(resource_path(process), function(process_data) {
                process_data = JSON.parse(process_data)
                $.get("/raspin/ui/process/?process_name=" + process_data["process_name"] + "&disp_name=" + process_data["process_disp_name"], function(html_doc) {
                    $("#main").append(html_doc)
                })
                    
            })
    
        })
    })
}

$(
function () {
}
)