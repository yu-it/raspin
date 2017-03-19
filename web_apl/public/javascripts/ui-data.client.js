routine_process()
routine_process_is_functioning = false
function routine_process() {
    routine_process_is_functioning = true
    if ( $(".field_data").find(".pv_base").length == 0) {
        routine_process_is_functioning = false
        return
    }
    setTimeout(function() {
        update_logging_data()
        routine_process()
    }, 1000);
}
function update_logging_data() {
    var data_views = $(".field_data").find(".pv_base");
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
                    } else if (view.attr("data_type")    == "message") {
                        view.find(".contents").html(view.find(".contents").html() + "<br/>" + entry.data)
                        view.attr("previous_processed_data_id",entry.data_id)
                    }
                })
            }
        },
        error : control_error_handler
    }
    )
        
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