routine_process()
routine_process_is_functioning = false
function routine_process() {
    routine_process_is_functioning = true
    if ( $("#main").find(".pv_base.pv_d").length == 0) {
        routine_process_is_functioning = false
        return
    }
    setTimeout(function() {
        update_logging_data()
        routine_process()
    }, 1000);
}
function update_logging_data() {
    var data_views = $("#main").find(".pv_base.pv_d");
    var urlstr = "raspin-api/GetOvservationData?"
    for(var i=0; i < data_views.length; i++) {
        var view = data_views.eq(i);
        urlstr += "pvid=" + view.attr("pvid") + "&previous_processed_data_id=" + view.attr("previous_processed_data_id") + "&"
    }
    urlstr = urlstr.substring(0, urlstr.length - 1)
    $.ajax(
    {
        url:urlstr,
        success : function(msg) {
            var htm = ""
            if (Array.isArray(msg)) {
                msg.forEach(function(entry){
                    var view = $("#" + entry.pvid)
                    if (view.attr("data_type") == "num") {
                        view.find(".contents").html(entry.data)
                        view.attr("previous_processed_data_id",entry.data_id)

                    } else if (view.attr("data_type") == "video") {
                    } else if (view.attr("data_type") == "message") {
                        var existing_text = view.find(".contents").html()
                        var index = -1
                        for (var i = 0; i < str_count(existing_text,"<br>") - 10; i++) {
                            index = existing_text.indexOf("<br>", index + 1)
                        }
                        if (index > 0) {
                            existing_text = existing_text.substring(index + "<br>".length)
                        }
                        view.find(".contents").html(existing_text + "<br/>" + entry.data)
                        view.attr("previous_processed_data_id",entry.data_id)
                    }
                })
            }
        },
        error : control_error_handler
    }
    )
        
}

function str_count(all, part) {
    return (all.match(new RegExp(part, "g")) || []).length;
}

function control_error_handler(msg) {
    if (msg.responseJSON.ret == "-1") {
        alert( "controller nashi")
        //$("#area_" + msg.responseJSON.pvid).remove()
        create_ui()
    } else {
        alert( "controller oyj")

    }

}