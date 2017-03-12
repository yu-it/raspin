routine_process()
routine_process_is_functioning = false
function routine_process() {
    routine_process_is_functioning = true
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
                    if ($("#num_" + entry.pvid).length) {
                        $("#num_" + entry.pvid).html(entry.data)
                        $("#area_" + entry.pvid).attr("previous_processed_data_id",entry.data_id)

                    } else if ($("#video_" + entry.pvid).length) {
                    } else if ($("#message_" + entry.pvid).length) {
                        $("#message_" + entry.pvid).text(entry.data)
                        $("#area_" + entry.pvid).attr("previous_processed_data_id",entry.data_id)
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