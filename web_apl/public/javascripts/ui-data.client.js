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
    for(var i=0; i < data_views.length; i++) {
        var view = data_views.eq(i);
        if (view.attr("data_type") == "video") {
            continue
        } else if (view.attr("data_type") == "num") {
            var pvid = view.attr("pvid")
            var urlstr = "raspin-api/GetOvservationData?pvid=" + pvid + "&previous_processed_data_id=" + view.attr("previous_processed_data_id")
            $.ajax(
            {
                url:urlstr,
                success : function(msg) {
                    var htm = ""
                    if (Array.isArray(msg)) {
                        msg.forEach(function(entry){
                            $("#num_" + entry.pvid).html(entry.data)
                            view.attr("previous_processed_data_id",entry.data_id)
                        })
                    }
                },
                error : control_error_handler
            }
            )
        } else if (view.attr("data_type") == "message") {
            var pvid = view.attr("pvid")
            var urlstr = "raspin-api/GetOvservationData?pvid=" + pvid + "&previous_processed_data_id=" + view.attr("previous_processed_data_id")
            $.ajax(
            {
                url:urlstr,
                success : function(msg) {
                    var htm = ""
                    if (Array.isArray(msg)) {
                        msg.forEach(function(entry){

                            $("#message_" + entry.pvid).text(entry.data)
                            view.attr("previous_processed_data_id",entry.data_id)
                        })
                    }
                },
                error : control_error_handler
            }
            )
        }
    }
        
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