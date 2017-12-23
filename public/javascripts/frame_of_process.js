function setup_process(process_name,disp_name) {
    console.log("target_process:" + resource_path(process_name) + "/ifs")
    $.get(resource_path(process_name) + "/ifs", function(ifs) {
        var ifs = JSON.parse(ifs)
        if (ifs == undefined || ifs.length == 0) {
            return;
        }
        ifs.forEach(function(iface) {
            console.log("url:" + resource_path(process_name) + "/ifs" + ", iface:" + iface)
            $("#" + escapeSelectorString(process_name) + "_container").append('<div class="' + resource_path(iface) + '"/>')
            $.get(resource_path(iface), function(if_data) {
                console.log(if_data)
                if_data = JSON.parse(if_data)
                var path_common = "/raspin/ui/" + if_data["if_kind"] + "?if_name=" + if_data["if_name"] + "&disp_name=" + if_data["if_disp_name"]
                var url = ""
                if (if_data["if_kind"] == "if_numbers") {
                    url = path_common + "&unit=" + if_data["unit"]
    
                } else if (if_data["if_kind"] == "if_arrows") {
                    url = path_common + "&enable=" + if_data["enable"]
                        
                } else if (if_data["if_kind"] == "if_buttons") {
                    url = path_common + "&on=" + if_data["on"] + "&off=" + if_data["off"]
                        
                } else if (if_data["if_kind"] == "if_toggles") {
                    var default_val = if_data["status"][0]
                    url = path_common + "&default_val=" + default_val
                }
                $.get(url, 
                function(html_doc) {
                    var a = $(id2JQCls(resource_path(iface))).replaceWith(html_doc)
                })
                bindIf(if_data)
                
            })
    
        })
    })
}
