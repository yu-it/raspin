function before_process() {
    $(".control").prop("disabled", true);
}

function after_process() {
    $(".control").prop("disabled", false);
    
}


function button_direction_click(pvid, message_name, direction) {
  //var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=" + direction
  //alert(urlstr)
  before_process()
  var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=" + direction
  $.ajax(
  {
   url:urlstr,
   success :
    function(msg) {
       var htm = ""
       update_ui(msg)
       after_process()
    },
   error : control_error_handler
  }
  )
 
}
function button_inp_click(pvid, inp_id, message_name) {
  before_process()
//  var src = pvid + "/" + ($("#" + inp_id).val())
//  alert (pvid + "-inp-" + src + "*" + message_name)
  var strings = encodeURI( $("#" + inp_id).val());
  var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=" + strings
  $.ajax(
  {
   url:urlstr,
   success :
    function(msg) {
       var htm = ""
       
//        $("#console_div").html(new Date().getTime().toString() + "/" + msg)
       update_ui(msg)
       after_process()
    },
   error : control_error_handler
  }
  )
}
function button_com_click(pvid, message_name) {
  before_process()
  var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=0"
  $.ajax(
  {
   url:urlstr,
   success :
    function(msg) {
       var htm = ""
       
//        $("#console_div").html(new Date().getTime().toString() + "/" + msg)
       update_ui(msg)
       after_process()
    },
   error : control_error_handler
  }
  )
}
function update_ui(res) {
	if (res.restype == "modify") {
        for (var i = 0; i < res.ctags[0].length; i++) {
        	if ($("#container_" + res.ctags[0][i]).length == 0) {
                var lay_param = res.ctags[2][i]
                var lay_id = lay_param2lay_id(lay_param)
                if ($("#" + lay_id).length == 0) {
                    $("#main").append(container_tags(lay_param))
                    
                }
                $("#" + lay_id + "_body").append('<div id=container_' + res.ctags[0][i] + '></div>')
        	}
		    $("#container_" + res.ctags[0][i]).html(res.ctags[1][i])
		
	    }
        for (var i = 0; i < res.dtags[0].length; i++) {
        	if ($("#container_" + res.dtags[0][i]).length == 0) {
                var lay_param = res.dtags[2][i]
                var lay_id =lay_param2lay_id(lay_param)
                if ($("#" + lay_id).length == 0) {
                    $("#main").append(container_tags(lay_param))
                    
                }
                var obj = $(res.dtags[1][i])
                if (obj.find(".message").length > 0) {
                    $("#" + lay_id + "_footer").append('<div id=container_' + res.dtags[0][i] + '></div>')

                } else {
                    $("#" + lay_id + "_body").append('<div id=container_' + res.dtags[0][i] + '></div>')

                }
        	}
		    $("#container_" + res.dtags[0][i]).html(res.dtags[1][i])
		    
		
	    }	
	    for (var i = 0; i < res.del.length; i++) {
            if ($("#container_" + res.del[i]).length) {
                $("#container_" + res.del[i]).remove()
            }
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
    after_process()

}