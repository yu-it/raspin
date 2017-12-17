var global_log = []
var ok_count = 0;
var ng_count = 0;

$(document).ready(
  function() {
      ut_server();
      $("#console").append("OK Count:" + ok_count + "<br/>")
      $("#console").append("NG Count:" + ng_count + "<br/>")
      global_log.forEach(function(item) {
          $("#console").append(item)
      })

  }
)
function log(str) {
    console.log(str)
    global_log.push(str)
    
}
function ng(e, str, arrays) {
    ng_count ++;
    log(":<b style='color:#FF0000;'>ng(" + e.status + ")" + " " + e.responseText)
    if (arrays != "undefined" && Array.isArray(arrays)) {
        arrays.forEach(function (item) {
            log("<li>" + item);
        })
    }
    log("<li>" + str)
    log("<br/>");
}
function ok(e, str, arrays) {
    ok_count ++;
    log(":<b>ok(" + e.status + ")" + " " + e.responseText);
    
    if (arrays != "undefined" && Array.isArray(arrays)) {
        arrays.forEach(function (item) {
            log("<li>" + item);
        })
    }
    log("<li>" + str)
    log("<br/>");
}
function http_put(arg_url, complete_func, body_data) {
    param = {
        url:arg_url,
        method:"PUT",
        async:false
    }
    if (body_data != undefined) {
        param["data"] = body_data;
    }
    var res = $.ajax(param)
    complete_func(res,arg_url,"")
    
}
function http_get(arg_url, complete_func) {
    var res = $.ajax(
    {
        url:arg_url,
        async:false,
        method:"GET",
    })
    complete_func(res,arg_url,"")
    
}
function http_del(arg_url, complete_func) {
    var res = $.ajax(
    {
        url:arg_url,
        async:false,
        method:"DELETE"
    })
    complete_func(res,arg_url,"")
    
}
function ut_server() {
    no1_ping();
    no2_machines_test_empty();
    no3_put_machine_test();
    no4_machines_test_containing_machines()
    no5_get_machine_test();
    no6_del_machine_test();
    no7_processes_test_empty();
    no8_put_processes_test();
    no9_processes_test_containing_process()
    no10_get_process_test();
    no11_del_process_test();
    var param = {
        "numbers":{"scale":2,"unit":"%"},
        "message":undefined,
        "logs":undefined,
        "arrows":{"enable":"lr"},
        "toggles":{"status":["a","b","c"]},
        "buttons":{"on":"on", "off":"off"}
    };
    var num = 12;
    ["numbers","messages","logs","arrows","toggles","buttons"].forEach(function (kind) {
        noXX_1_if_test_empty(num, kind, param[kind]);
        num ++;
        noXX_2_put_if_test(num, kind, param[kind]);
        num ++;
        noXX_3_if_test_containing_if(num, kind, param[kind])
        num ++;
        noXX_4_get_if_test(num, kind, param[kind])
        num ++;
        noXX_5_del_if_test(num, kind, param[kind])
        num ++;
        http_del("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
        function(e, xhr, settings){
        });
        http_del("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2",
        function(e, xhr, settings){
        });
        

    })
    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/hiding_rules")
    num ++;
    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/hiding_rules")
    num ++;
    //テスト用IFの登録
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_a",function(e, xhr, settings){
    
    },param["numbers"])
    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_a/hiding_rules")
    num ++;

    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/disable_rules")
    num ++;
    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/disable_rules")
    num ++;
    noXX_hiding_disable_rule(num,"http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_a/disable_rules")
    num ++;
    noXX_put_data(num,"http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_a")

    
}
function noXX_put_data(num,baseUrl) {
    http_get(baseUrl + "/data",
    function(e, xhr, settings){
        log("test" + num + " IFデータ非存在テスト")
        if(e.status === 404){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    http_put(baseUrl + "/data",
    function(e, xhr, settings){
        log("test" + num + " IFデータ登録テスト")
        if(e.status === 200){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    },{"data":1000});
    http_get(baseUrl + "/data",
    function(e, xhr, settings){
        log("test" + num + " IFデータ1件登録テスト")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
        obj[0] == 1000){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });

    http_put(baseUrl + "/data",
    function(e, xhr, settings){
        log("test" + num + " hiding_rule登録テスト(2つ目)")
        if(e.status === 200){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    },{"data":2000});
    http_get(baseUrl + "/data",
    function(e, xhr, settings){
        log("test" + num + " IFデータ2件登録テスト")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
        obj[0] == 2000){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    for (var i = 3; i <= 10; i++) {
        http_put(baseUrl + "/data",
        function(e, xhr, settings){
            log("test" + num + " IFデータ登録テスト" + i + "件目")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },{"data":1000 * i});
    }
    http_get(baseUrl + "/data?from=3&to=7",
    function(e, xhr, settings){
        log("test" + num + " IFデータ断面取得テスト(途中一部スライス)")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
        obj[0] == 4000 && 
        obj[1] == 5000 &&
        obj[2] == 6000 &&
        obj[3] == 7000 &&
        obj[4] == 8000){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    http_get(baseUrl + "/data?from=8&to=20",
    function(e, xhr, settings){
        log("test" + num + " IFデータ断面取得テスト(toがはみ出)")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
            obj[0] == 9000 && 
            obj[1] == 10000 &&
            obj.length == 2){
                ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });

    http_get(baseUrl + "/data?from=7",
    function(e, xhr, settings){
        log("test" + num + " IFデータ断面取得テスト(fromのみ指定)")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
            obj[0] == 8000 && 
            obj[1] == 9000 && 
            obj[2] == 10000 &&
            obj.length == 3){
                ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });

    http_get(baseUrl + "/data?to=3",
    function(e, xhr, settings){
        log("test" + num + " IFデータ断面取得テスト(toのみ指定)")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
            obj[0] == 1000 && 
            obj[1] == 2000 && 
            obj[2] == 3000 &&
            obj[3] == 4000 &&
            obj.length == 4){
                ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });

}


function noXX_hiding_disable_rule(num,baseUrl) {
    http_get(baseUrl,
    function(e, xhr, settings){
        log("test" + num + " hiding_rule非存在テスト")
        if(e.status === 404){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    http_put(baseUrl + "/machines/machine_a/processes/proc_a/ifs/if_a/data/on",
    function(e, xhr, settings){
        log("test" + num + " hiding_rule登録テスト")
        if(e.status === 200){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    },);
    http_put(baseUrl + "/machines/machine_a/processes/proc_a/ifs/if_a/data/off",
    function(e, xhr, settings){
        log("test" + num + " hiding_rule登録テスト(2つ目)")
        if(e.status === 200){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    },);
    http_get(baseUrl,
    function(e, xhr, settings){
        log("test" + num + " hiding_rule取得")
        try {
            var obj = JSON.parse(e.responseText)
        }catch (ex) {
            var obj =["",""]
        }
        if(e.status === 200 && 
            obj[0] == "/machines/machine_a/processes/proc_a/ifs/if_a/data/on" &&
            obj[1] == "/machines/machine_a/processes/proc_a/ifs/if_a/data/off"){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    http_del(baseUrl,
    function(e, xhr, settings){
        log("test" + num + " hiding_rule一括削除")
        if(e.status === 200){
            ok(e, xhr, [])
        }else{
            ng(e, xhr, [])
        }
    });
    http_get(baseUrl,
        function(e, xhr, settings){
            log("test" + num + " hiding_rule非存在テスト")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    }
function noXX_5_del_if_test(num, kind, params) {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/if_del",
        function(e, xhr, settings){
            log("test" + num + " put_if_deltest(for deltest) (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        }, params);
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/if_del",
        function(e, xhr, settings){
            log("test" + num + " get_if_deltest(for deltest) (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "",
        function(e, xhr, settings){
            log("test" + num + " get_if_" + kind + "(for deltest) (in)")
            try{
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && obj.length == 3){
                    ok(e, xhr, [])
                }else{
                    ng(e, xhr, [])
                }

            }catch (ex) {
                ng(e, xhr, [])

            }
        });
    http_del("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/if_del",
        function(e, xhr, settings){
            log("test" + num + " del_if_" + kind + " (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/if_del",
        function(e, xhr, settings){
            log("test" + num + " check_proc_c_delete(for deltest) (in)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "",
        function(e, xhr, settings){
            log("test" + num + " check_procs(for deltest) (in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && obj.length == 2){
                    ok(e, xhr, [])
                }else{
                    ng(e, xhr, [])
                }

            } catch(ex) {
                ng(e, xhr, [])

            }
        });
}
function check_param_and_response(res, param) {
    for (k in param) {
        if (param[k] != res[k]) {
            return false
        }
    }
    return true;
}
function noXX_4_get_if_test(num, kind, params) {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
        function(e, xhr, settings){
            log("test" + num + " numif_1(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj["if_name"] == "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1" && 
                    obj["if_disp_name"] == "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1" &&
                    obj["if_kind"] == "if_" + kind + ""){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, ["predict ifname:/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
                    "predict if_disp_name:/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
                    "predict if_kind:if_" + kind + "",
                    "actual ifname:"+obj["if_name"],
                    "actual if_disp_name:"+obj["if_disp_name"],
                    "actual if_kind:"+obj["if_kind"]])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2",
        function(e, xhr, settings){
            log("test" + num + " numif_2(in)")
            try {
                var obj = JSON.parse(e.responseText)
                var additional_params_ok = true;
                var ngList = []
                for (k in params) {
                    
                    if (!(k in obj) || obj[k].toString() != params[k].toString()) {
                        ngList.push("predict " + k + " = " + params[k])
                        ngList.push("actual " + k + " = " + (k in obj) ? obj[k] : "-not exists-")
                        additional_params_ok = false;
                    }
                }
                if(e.status === 200 && 
                    obj["if_name"] == "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2" && 
                    obj["if_disp_name"] == "if_disp_b" &&
                    obj["if_kind"] == "if_" + kind + "" && additional_params_ok){
                    ok(e, xhr, [])
                    
                } else {
                    ngList.push("predict if_name = " + obj["if_name"] );
                    ngList.push("predict if_disp_name = " + obj["if_disp_name"] );
                    ngList.push("predict if_kind = " + obj["if_kind"] );
                    ngList.push("actual if_name = " + "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2");
                    ngList.push("actual if_disp_name = " + "if_disp_b");
                    ngList.push("actual if_kind = " + "if_" + kind);
                    ng(e, xhr, ngList)
                }
            }catch (ex) {
                ng(e, xhr, ["error"])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_3",
        function(e, xhr, settings){
            log("test" + num + " num_if存在しないifに対して(in)")
            try {
                if(e.status === 404){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_" + kind + "/" + kind + "if_2",
        function(e, xhr, settings){
            log("test" + num + " num_if存在しないifに対して(in)")
            try {
                if(e.status === 404){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_" + kind + "/" + kind + "if_2",
        function(e, xhr, settings){
            log("test" + num + " num_if存在しないプロセスに対して(in)")
            try {
                if(e.status === 404){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_c/processes/proc_a/if_" + kind + "/" + kind + "if_1",
        function(e, xhr, settings){
            log("test" + num + " num_if存在しないマシンに対して(in)")
            try {
                if(e.status === 404){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });

}
function noXX_3_if_test_containing_if(num, kind) {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "",
        function(e, xhr, settings){
            log("test" + num + " if_" + kind + "_リスト取得テスト(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj[0] == "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1" && 
                    obj[1] == "/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        });

}
function noXX_2_put_if_test(num, kind, params) {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
        function(e, xhr, settings){
            log("test" + num + " put_numif_1 (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
    if ( kind == "toggles") {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1/data",
        function(e, xhr, settings){
            try {
                var obj = JSON.parse(e.responseText)
            } catch (ex) {
                var obj = [""]
            }
            
            log("test" + num + " デフォルト確認(toggle) (in)")
            if(e.status === 200 && obj[0] == params["status"][0]){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
        
    }
    if ( kind == "buttons") {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1/data",
        function(e, xhr, settings){
            try {
                var obj = JSON.parse(e.responseText)
            } catch (ex) {
                var obj = [""]
            }
            log("test" + num + " デフォルト確認 (buttons)(in)")
            if(e.status === 200 && obj[0] == "off"){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
        
    }
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_1",
        function(e, xhr, settings){
            log("test" + num + " put_numif_1(exists)(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);

    var additional_params = "";
    for (k in params) {
        
        if (Array.isArray(params[k])) {
            params[k].forEach(function(item) {
                additional_params += "&" + k + "=" + item
            })            
        } else {
                additional_params += "&" + k + "=" + params[k]

        }
    }
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2?if_disp_name=if_disp_b&" + additional_params,
        function(e, xhr, settings){
            log("test" + num + " put_numif_2")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "/" + kind + "if_2?a=b" + additional_params,
        function(e, xhr, settings){
            log("test" + num + " put_numif_2(exists)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_d/if_" + kind + "/" + kind + "if_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test" + num + " put_numif_2(存在しないプロセスに対して)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
    http_put("http://localhost:3000/raspin/internal/machines/machine_d/processes/proc_d/if_" + kind + "/" + kind + "if_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test" + num + " put_numif_2(存在しないマシンに対して)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        },params);
}
function noXX_1_if_test_empty(num, kind) {
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_" + kind + "",
     function(e, xhr, settings){
            log("no" + num + "_if_test_empty")
            if(e.status === 200) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_" + kind + "",
     function(e, xhr, settings){
            log("no" + num + "_if_test_empty(存在しないプロセス)")
            if(e.status === 404) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
    http_get("http://localhost:3000/raspin/internal/machines/machine_d/processes/proc_a/if_" + kind + "",
     function(e, xhr, settings){
            log("no" + num + "_if_test_empty(存在しないマシン)")
            if(e.status === 404) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
}
function no11_del_process_test() {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c",
        function(e, xhr, settings){
            log("test11 put_proc_c(for deltest) (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c",
        function(e, xhr, settings){
            log("test11 check_proc_c(for deltest) (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/",
        function(e, xhr, settings){
            log("test11 check_procs(for deltest) (in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && obj.length == 3){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_del("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c",
        function(e, xhr, settings){
            log("test11 del_proc_c(for deltest) (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c",
        function(e, xhr, settings){
            log("test11 check_proc_c_delete(for deltest) (in)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/",
        function(e, xhr, settings){
            log("test11 check_procs(for deltest) (in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && obj.length == 2){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
}
function no10_get_process_test() {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a",
        function(e, xhr, settings){
            log("test10 process_proc_a(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj["process_name"] == "/machines/machine_a/processes/proc_a" && 
                    obj["process_disp_name"] == "/machines/machine_a/processes/proc_a"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_b",
        function(e, xhr, settings){
            log("test10 process_proc_b(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj["process_name"] == "/machines/machine_a/processes/proc_b" && 
                    obj["process_disp_name"] == "proc_disp_b"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c",
        function(e, xhr, settings){
            log("test10 process_not_exist(in)")
            try {
                if(e.status === 404){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });

}
function no9_processes_test_containing_process() {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes",
        function(e, xhr, settings){
            log("test9 processes_containing_data(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj[0] == "/machines/machine_a/processes/proc_a" && 
                    obj[1] == "/machines/machine_a/processes/proc_b"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        });

}
function no8_put_processes_test() {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a",
        function(e, xhr, settings){
            log("test8 put_proc_a (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a",
        function(e, xhr, settings){
            log("test8 put_proc_a_exists(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_b?process_disp_name=proc_disp_b",
        function(e, xhr, settings){
            log("test8 put_proc_b (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_b",
        function(e, xhr, settings){
            log("test8 put_proc_b_exists(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_c/processes/proc_c",
        function(e, xhr, settings){
            log("test8 put_proc_c_exists(存在しないマシンに対して(in)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
}
function no7_processes_test_empty() {
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes",
     function(e, xhr, settings){
            log("no7 processes empty(in)")
            if(e.status === 200) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
    http_get("http://localhost:3000/raspin/internal/machines/machine_c/processes",
     function(e, xhr, settings){
            log("no7 processes empty　ただし、存在しないmachine(in)")
            if(e.status === 404) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
}
function no6_del_machine_test() {
    http_get("http://localhost:3000/raspin/internal/machines",
        function(e, xhr, settings){
            log("test6 check_before_test(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj[0] == "/machines/machine_a" && 
                obj[1] == "/machines/machine_b"){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });

    http_put("http://localhost:3000/raspin/internal/machines/machine_c",
        function(e, xhr, settings){
            log("test6 put_test_data (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_d?machine_disp_name=disp_d_machine",
        function(e, xhr, settings){
            log("test6 put_test_data (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        });

    http_get("http://localhost:3000/raspin/internal/machines",
        function(e, xhr, settings){
            log("test6 check_test_data(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj[2] == "/machines/machine_c" && 
                obj[3] == "/machines/machine_d"){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });
    http_del("http://localhost:3000/raspin/internal/machines/machine_d",
        function(e, xhr, settings){
            log("test6 check_test_data(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            } else {
                ng(e, xhr, [])
            }
        
        });
    http_get("http://localhost:3000/raspin/internal/machines",
        function(e, xhr, settings){
            log("test6 check_delete_1(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj[2] == "/machines/machine_c" && 
                obj.length == 3){
                ok(e, xhr, [])
            } else {
                ng(e, xhr, [])
            }
        
        });
    http_del("http://localhost:3000/raspin/internal/machines/machine_c",
        function(e, xhr, settings){
            log("test6 check_test_data(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            } else {
                ng(e, xhr, [])
            }
        
        });

    http_get("http://localhost:3000/raspin/internal/machines",
        function(e, xhr, settings){
            log("test6 check_delete_2(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj[1] == "/machines/machine_b" && 
                obj.length == 2){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_c",
        function(e, xhr, settings){
            log("test6 check_delete_1_each_content(in)")
            if(e.status === 404){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
    
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_d",
        function(e, xhr, settings){
            log("test6 check_delete_2_each_content")
            if(e.status === 404){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });
}
function no5_get_machine_test() {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a",
        function(e, xhr, settings){
            log("test5 machine_1(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj["machine_name"] == "/machines/machine_a" && 
                obj["machine_disp_name"] == "/machines/machine_a"){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_b",
        function(e, xhr, settings){
            log("test5 machine_2(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj["machine_name"] == "/machines/machine_b" && 
                obj["machine_disp_name"] == "disp_b_machine"){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });

}
function no4_machines_test_containing_machines() {
        http_get("http://localhost:3000/raspin/internal/machines",
        function(e, xhr, settings){
            log("test4 machines_containing_data(in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && 
                obj[0] == "/machines/machine_a" && 
                obj[1] == "/machines/machine_b"){
                ok(e, xhr, [])
                
            } else {
                ng(e, xhr, [])
            }
        
        });

}
function no3_put_machine_test() {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a",
        function(e, xhr, settings){
            log("test3 put_machine1_1 (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a",
        function(e, xhr, settings){
            log("test3 put_machine1_2(existing) (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_b?machine_disp_name=disp_b_machine",
        function(e, xhr, settings){
            log("test3 put_machine2_1 (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_b",
        function(e, xhr, settings){
            log("test3 put_machine2_2 (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
}
function no2_machines_test_empty() {
    http_get("http://localhost:3000/raspin/internal/machines",
     function(e, xhr, settings){
            log("test2 machines empty(in)")
            var ar = JSON.parse(e.responseText)
            if(e.status === 200 && Array.isArray(ar) && ar.length == 0) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
}

function no1_ping() {
    http_get("http://localhost:3000/raspin/internal/ping",
        function(e, xhr, settings){
            log("test1 ping(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        
        })
}
