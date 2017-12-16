function hidden(name, val) {
    if (val == undefined) {
        return $("#main").attr(name)
    } else {
        $("#main").attr(name, val)
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
    $("#main").append(tag)
    
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
    $.get("/raspin/internal/machines", function(machines) {
        machines = JSON.parse(machines)
        if (machines == undefined || machines.length == 0) {
            common_dialog("選択できるマシンがありません。",{"再読み込み":function(){ $( this ).dialog( "close" );select_machine();}})
            
        } else {
            common_selector("aaa",machines,{"決定":function(){ $( this ).dialog( "close" );load_machine(hidden("sel_val"));}})
        }
    })
}
function load_machine(machine) {
alert(machine)
}
$(
function () {
    var machine = select_machine();
}
)