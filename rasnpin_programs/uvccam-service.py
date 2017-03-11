# ./mjpg_streamer -i "./input_uvc.so -f 2 -r 320x240 -d /dev/video0 -y" -o "./output_http.so -w ./www -p 8080"
from raspin import raspin
import subprocess
import time
from datetime import datetime

proc = None

json_stopping = {"pvname": "camera_switch", "queue_size": 5000,
                 "available_message": [{"message_name": "on", "arg_count": 1},
                                       {"message_name": "end_camera_service",
                                        "arg_count": 1}]}

json_running = {"pvname": "camera_switch", "queue_size": 5000,
                "available_message": [{"message_name": "off", "arg_count": 1},
                                      {"message_name": "end_camera_service",
                                       "arg_count": 1}]}


def log(str):
    print("{stp} {str}".format(stp=timestp(), str=str))


def timestp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def launch_camera():
    cmd = ["./mjpg_streamer"
        , "-i"
        , './input_uvc.so -f 10 -r 320x240 -d /dev/video0 -y'
        , "-o"
        , './output_http.so -w ./www -p 8080']
    global proc
    proc = subprocess.Popen(cmd, cwd="/home/pi/bin/programs/camera_inst/mjpg-streamer/mjpg-streamer")
    # proc.communicate()
    time.sleep(3)
    print("@kidou kanryou")


def stop_camera():
    global proc
    proc.terminate()
    proc = None


def show_receive_data(data):
    print (data)


id = raspin.RegistControllerProvider(json_stopping)
last_req_id = ""
counter = 0
data_pv_id = ""
while True:
    mess = raspin.SubscribeControlMessage(id, last_req_id, 100)
    log("docs------")
    log(mess)
    if mess is None:
        continue
    last_req_id = mess['req_id']
    if mess["message"] == "end_camera_service":
        time.sleep(3)
        raspin.Acknowledge(id, mess['req_id'], {"ret": "1", "u": [], "d": [data_pv_id, id]})
        if data_pv_id <> "":
            raspin.DeleteProvider(data_pv_id)
        break
    else:
        log("pvid:{pv},req_id:{req}".format(req=mess['req_id'], pv=id))
        if proc is None:
            launch_camera()
            data_pv_id = raspin.RegistDataProvider(
                {"pvname": "camera_stream", "queue_size": 5000, "type": "video"})
            raspin.ModControllerProvider(id, json_running)
            raspin.Acknowledge(id, mess['req_id'], {"ret": "1", "u": [data_pv_id, id], "d": []})

        else:
            raspin.DeleteProvider(data_pv_id)
            stop_camera()
            raspin.ModControllerProvider(id, json_stopping)
            raspin.Acknowledge(id, mess['req_id'], {"ret": "1", "d": [data_pv_id], "u": [id]})

raspin.DeleteProvider(id)
stop_camera()

#
"""

# ./mjpg_streamer -i "./input_uvc.so -f 2 -r 320x240 -d /dev/video0 -y" -o "./output_http.so -w ./www -p 8080"
import pymongo
import subprocess
import time
import urllib2
from datetime import datetime
import json

proc = None

json_stopping = {"pvname": "camera_switch", "queue_size": 5000,
                 "available_message": [{"message_name": "on", "arg_count": 1},
                                       {"message_name": "end_camera_service",
                                        "arg_count": 1}]}

json_running = {"pvname": "camera_switch", "queue_size": 5000,
                "available_message": [{"message_name": "off", "arg_count": 1},
                                      {"message_name": "end_camera_service",
                                       "arg_count": 1}]}


def log(str):
    print("{stp} {str}".format(stp=timestp(), str=str))


def timestp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def launch_camera():
    cmd = ["./mjpg_streamer"
        , "-i"
        , './input_uvc.so -f 10 -r 320x240 -d /dev/video0 -y'
        , "-o"
        , './output_http.so -w ./www -p 8080']
    global proc
    proc = subprocess.Popen(cmd, cwd="/home/pi/bin/programs/camera_inst/mjpg-streamer/mjpg-streamer")
    # proc.communicate()
    time.sleep(3)
    print("@kidou kanryou")


def stop_camera():
    global proc
    proc.terminate()
    proc = None


def SubscribeControlMessage(pvid, previous_processed_req_id, timeout_second):
    url = 'http://localhost:3000/fw/SubscribeControlMessage?pvid={pvid}&previous_processed_req_id={ppreq}'
    r = None
    try:
        r = urllib2.urlopen(url.format(pvid=pvid, ppreq=previous_processed_req_id))
        res = r.read()
        return json.loads(res)
    except:
        return None
    finally:
        if r <> None:
            r.close()


def show_receive_data(data):
    print (data)


client = pymongo.MongoClient('localhost', 27017)
db = client.test
id = db.system_js.RegistControllerProvider(json_stopping)
last_req_id = ""
counter = 0
while True:
    mess = SubscribeControlMessage(id, last_req_id, 100)
    log("docs------")
    log(mess)
    if mess is None:
        continue
    last_req_id = mess['req_id']
    if mess["message"] == "end_camera_service":
        time.sleep(3)
        db.system_js.Acknowledge(id, mess['req_id'], {"ret": "1", "u": [], "d": [id]})
        break
    else:
        log("pvid:{pv},req_id:{req}".format(req=mess['req_id'], pv=id))
        if proc is None:
            launch_camera()
            data_pv_id = db.system_js.RegistDataProvider(
                {"pvname": "camera_stream", "queue_size": 5000, "type": "video"})
            db.system_js.ModControllerProvider(id, json_running)
            db.system_js.Acknowledge(id, mess['req_id'], {"ret": "1", "u": [data_pv_id, id], "d": []})

        else:
            db.system_js.DeleteProvider(data_pv_id)
            stop_camera()
            db.system_js.ModControllerProvider(id, json_stopping)
            db.system_js.Acknowledge(id, mess['req_id'], {"ret": "1", "d": [data_pv_id], "u": [id]})

db.system_js.DeleteProvider(id)
stop_camera()


"""