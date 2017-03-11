function button_direction_click(pvid, message_name, direction) {
  var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=" + direction
  alert(urlstr)
  /*
  $.ajax(
  {
   url:urlstr,
   success :
    function(msg) {
       var htm = ""
       msg.forEach(
         function (entry) {
            alert(msg)
         }
       )
    }
  }
  )
  */
 
}
function button_inp_click(pvid, inp_id, message_name) {
    var src = pvid + "/" + ($("#" + inp_id).val())
    alert (pvid + "-inp-" + src + "*" + message_name)
}
function button_com_click(pvid, message_name) {
  var urlstr = "raspin-api/SendToController?pvid=" + pvid + "&message=" + message_name + "&arg=0"
  $.ajax(
  {
   url:urlstr,
   success :
    function(msg) {
       var htm = ""
       
//        $("#console_div").html(new Date().getTime().toString() + "/" + msg)
       update_ui(msg)
    },
   error : control_error_handler
  }
  )
}
function update_ui(res) {
	if (res.restype == "modify") {
        for (var i = 0; i < res.ctags[0].length; i++) {
        	if ($("#" + res.ctags[0][i]).length == 0) {
        		$(".field_controller").append('<div id="' + res.ctags[0][i] + '"></div>')
        	}
		    $("#" + res.ctags[0][i]).html(res.ctags[1][i])
		
	    }
        for (var i = 0; i < res.dtags[0].length; i++) {
        	if ($("#" + res.dtags[0][i]).length == 0) {
        		$(".field_data").append('<div id="' + res.dtags[0][i] + '"></div>')
        	}
		    $("#" + res.dtags[0][i]).html(res.dtags[1][i])
		    
		
	    }	
	    for (var i = 0; i < res.del.length; i++) {
            if ($("#" + res.del[i]).length) {
                $("#" + res.del[i]).remove()
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

}