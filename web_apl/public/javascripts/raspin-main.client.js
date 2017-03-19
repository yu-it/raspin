$(document).ready(
  create_ui()
)
function create_ui() {
   $(".field_controller").html("building controllers...")

 $.ajax(
  {
   url:"raspin-api/AvailableControllerProvider",
   success : function(msg) {
    var htm = ""
    if (msg.length == 0) {
       $(".field_controller").html("no controll ui is available >_<")
    } else {
      msg.forEach(
        create_each_controller_ui
      )
    }
   }
  }
 )

 $.ajax(
  {
   url:"raspin-api/AvailableDataProvider",
   success : function(msg) {
    var htm = ""
    if (msg.length == 0) {
       $(".field_data").html("no data ui is available >_<")
    } else {
      msg.forEach(
        create_each_data_ui
      )
    }
   }
  }
 )

}
function create_each_controller_ui(entry) {
    var urlstring = "ui-controller?pvid=" + entry.pvid + "&pvname=" + entry.pvname + "&layout_param=" + entry.layout_param
    if (Array.isArray(entry.available_message)) {
      entry.available_message.forEach(
        function (mess) {
          urlstring += "&available_message=" + mess.message_name
          urlstring += "&arg=" + mess.arg
          
        })

    } else {
      urlstring += "&available_message=" + entry.available_message.message_name
      urlstring += "&arg=" + entry.available_message.arg
    }
    $.ajax(
    {
      url:urlstring,
      //url:"ui/controller?pvid=" + entry.pvid + "&a=aa&a=bb&a=cc",
      async:false ,
      success :
      function(msg) {
          var lay_param = entry["layout_param"]
          if ($("." + lay_param).length == 0) {
              $("#main").append('<div id="' + lay_param + '" class="' + lay_param + '"></div>')
            
          }
          $("." + lay_param).append('<div id=container_' + entry.pvid + '></div>')
          $("#container_" + entry.pvid).html(msg)
      },
      err :function(e) {
        alert("err")
      }
    }
  )

}
function create_each_data_ui(entry) {
   $(".field_data").html("building controllers...")
    var urlstring = "ui-data?pvid=" + entry.pvid + "&pvname=" + entry.pvname + "&type=" + entry.type + "&layout_param=" + entry.layout_param
    $.ajax(
    {
      url:urlstring,
      async:false ,
      success :
      function(msg) {
          var lay_param = entry["layout_param"]
          if ($("." + lay_param).length == 0) {
              $("#main").append('<div id="' + lay_param + '" class="' + lay_param + '"></div>')
            
          }
          $("." + lay_param).append('<div id=container_' + entry.pvid + '></div>')
          $("#container_" + entry.pvid).html(msg)
      },
      err :function(e) {
        alert("err")
      }
    }
  )

}
