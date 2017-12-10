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
function http_put(arg_url, complete_func) {
    var res = $.ajax(
    {
        url:arg_url,
        method:"PUT",
        async:false
        
    })
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
    no12_if_test_empty();
    no14_put_if_num_test();
    no15_if_nums_test_containing_if()
    no16_get_if_nums_test()
    no17_del_if_nums_test()
}
function no17_del_if_nums_test() {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_del",
        function(e, xhr, settings){
            log("test17 put_if_deltest(for deltest) (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_del",
        function(e, xhr, settings){
            log("test17 get_if_deltest(for deltest) (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers",
        function(e, xhr, settings){
            log("test17 get_if_numbers(for deltest) (in)")
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
    http_del("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_del",
        function(e, xhr, settings){
            log("test17 del_if_numbers (in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/if_del",
        function(e, xhr, settings){
            log("test17 check_proc_c_delete(for deltest) (in)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers",
        function(e, xhr, settings){
            log("test17 check_procs(for deltest) (in)")
            var obj = JSON.parse(e.responseText)
            if(e.status === 200 && obj.length == 2){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
}
function no16_get_if_nums_test() {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_1",
        function(e, xhr, settings){
            log("test16 numif_1(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj["if_name"] == "/machines/machine_a/processes/proc_a/if_numbers/numif_1" && 
                    obj["if_disp_name"] == "/machines/machine_a/processes/proc_a/if_numbers/numif_1" &&
                    obj["unit"] == "" &&
                    obj["scale"] == 0){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_2",
        function(e, xhr, settings){
            log("test16 numif_2(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj["if_name"] == "/machines/machine_a/processes/proc_a/if_numbers/numif_2" && 
                    obj["if_disp_name"] == "if_disp_b" &&
                    obj["scale"] == "2" &&
                    obj["unit"] == "%"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        
        });
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_3",
        function(e, xhr, settings){
            log("test16 num_if存在しないifに対して(in)")
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
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_numbers/numif_2",
        function(e, xhr, settings){
            log("test16 num_if存在しないifに対して(in)")
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
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_numbers/numif_2",
        function(e, xhr, settings){
            log("test16 num_if存在しないプロセスに対して(in)")
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
        http_get("http://localhost:3000/raspin/internal/machines/machine_c/processes/proc_a/if_numbers/numif_1",
        function(e, xhr, settings){
            log("test16 num_if存在しないマシンに対して(in)")
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
function no15_if_nums_test_containing_if() {
        http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers",
        function(e, xhr, settings){
            log("test15 if_numbers_リスト取得テスト(in)")
            try {
                var obj = JSON.parse(e.responseText)
                if(e.status === 200 && 
                    obj[0] == "/machines/machine_a/processes/proc_a/if_numbers/numif_1" && 
                    obj[1] == "/machines/machine_a/processes/proc_a/if_numbers/numif_2"){
                    ok(e, xhr, [])
                    
                } else {
                    ng(e, xhr, [])
                }
            }catch (ex) {
                ng(e, xhr, [])
                
            }        
        });

}
function no14_put_if_num_test() {
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_1",
        function(e, xhr, settings){
            log("test14 put_numif_1 (in)")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_1",
        function(e, xhr, settings){
            log("test14 put_numif_1(exists)(in)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test14 put_numif_2")
            if(e.status === 201){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers/numif_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test14 put_numif_2(exists)")
            if(e.status === 200){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_d/if_numbers/numif_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test14 put_numif_2(存在しないプロセスに対して)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
    http_put("http://localhost:3000/raspin/internal/machines/machine_d/processes/proc_d/if_numbers/numif_2?if_disp_name=if_disp_b&unit=%&scale=2",
        function(e, xhr, settings){
            log("test14 put_numif_2(存在しないマシンに対して)")
            if(e.status === 404){
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])
            }
        });
}
function no12_if_test_empty() {
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_a/if_numbers",
     function(e, xhr, settings){
            log("no12_if_test_empty")
            if(e.status === 200) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
    http_get("http://localhost:3000/raspin/internal/machines/machine_a/processes/proc_c/if_numbers",
     function(e, xhr, settings){
            log("no12_if_test_empty(存在しないプロセス)")
            if(e.status === 404) {
                ok(e, xhr, [])
            }else{
                ng(e, xhr, [])

            }
        })
    http_get("http://localhost:3000/raspin/internal/machines/machine_d/processes/proc_a/if_number",
     function(e, xhr, settings){
            log("no12_if_test_empty(存在しないマシン)")
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
