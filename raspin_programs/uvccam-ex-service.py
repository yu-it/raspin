# -*- coding: utf-8 -*-
import raspin.pysical_util as p
from datetime import datetime
import raspin.raspin
from multiprocessing import Process
import subprocess
import raspin.my_mailer as mailer
import time
import numpy
import requests
from PIL import Image
import raspin.my_mailer
from StringIO import StringIO
import raspin.pysical_util as py


p = None
detect_p = None
console_pvid = None

available_mess_cam_on = {"message_name": "on", "arg": 1}
available_mess_cam_off = {"message_name": "off", "arg": 1}
available_mess_detect_on = {"message_name": "detect_move", "arg": 1}
available_mess_detect_off = {"message_name": "no_detecting", "arg": 1}
available_mess_left = {"message_name": "left", "arg": 1}
available_mess_right = {"message_name": "right", "arg": 1}
available_mess_front = {"message_name": "front", "arg": 1}
current_availables = [available_mess_cam_on, available_mess_detect_on, available_mess_left, available_mess_front, available_mess_right]
layout_param_con = "default-controller@command console"
layout_param_data = "default-data@basic data"


def log(str):
    print(str)

def stop_process():
    global p
    p.terminate()
    p = None


def launch_process(data_pvid):
    global p
    cmd = ["./mjpg_streamer"
        , "-i"
        , './input_raspicam.so -fps 10 -x 320 -y 240'
        , "-o"
        , './output_http.so -w ./www -p 8080']

    p = subprocess.Popen(cmd, cwd="/home/pi/bin/programs/camera_inst/mjpg-streamer/mjpg-streamer-experimental")
    # proc.communicate()
    time.sleep(3)
    print("@kidou kanryou")


def http_get(url):
    res = requests.get(url)
    return res.content

def observe(data_pvid):
    print("1")

    api = raspin.raspin.api("localhost", 3000)
    img1 = Image.open(StringIO(http_get("http://localhost:8080/?action=snapshot")))
    counter = 0
    mail_count = 0
    while True:
        if mail_count > 50:
            return
        data1 = numpy.array(img1)
        time.sleep(1)
        img2 = Image.open(StringIO(http_get("http://localhost:8080/?action=snapshot")))
        data2 = numpy.array(img2)
        sum = numpy.sum(numpy.sqrt((data1 - data2) ** 2))
        print(sum)
        if sum > 1500000:
            counter += 1
            if counter < 3:
                print("suspicious person")
                mail_count += 1
                img2.save("./stranger.jpeg")
                api.add_observation_data(data_pvid, datetime.now().strftime("%Y/%m/%d %H:%M:%S") + "人物を検出しました。")
                raspin.my_mailer.send_mail_with_picture("fwje7971@hotmail.com", "suspicious person", "人物を検出しました。", "./stranger.jpeg")
            elif counter > 10:
                counter = 0
                img1 = img2

        else:
            counter = 0
            img1 = img2
    #with open(r"c:\myspace\a.jpg", "wb") as w:
    #    w.write(data)


if __name__ == "__main__":
    api = raspin.raspin.api("localhost", 3000)
    pvid = api.register_controller_provider(
        "uvc_cam",
        5000,
        current_availables,
        layout_param_con)["pvid"]
    while True:
        mess = api.subscribe_control_message(pvid, 100)
        log("docs------")
        log(mess)
        if mess["ret"] == "to":
            log("timeout")
            continue
        if mess["message"] == available_mess_cam_on["message_name"]:
            data_pv_id = api.register_data_provider("uvc_cam", 5000,
                                                         "video", "-",
                                                    layout_param_data)["pvid"]
            launch_process(data_pv_id)
            current_availables[0] = available_mess_cam_off
            api.mod_controller_provider(pvid,
                                             "uvc_cam",
                                             5000,
                                             current_availables,
                                             layout_param_con
                                             )
            api.acknowledge(pvid, mess['req_id'], "1", [pvid, data_pv_id], [])
        elif mess["message"] == available_mess_cam_off["message_name"]:
            api.delete_provider(data_pv_id)
            stop_process()
            current_availables[0] = available_mess_cam_on
            api.mod_controller_provider(pvid,
                                             "uvc_cam",
                                             5000,
                                             current_availables,
                                             layout_param_con
                                             )
            api.acknowledge(pvid, mess['req_id'], "1", [pvid], [data_pv_id])
            data_pv_id = ""

        elif mess["message"] == available_mess_detect_on["message_name"]:
            if current_availables[0]["message_name"] == "on":   #it is when cam is stopping
                continue
            console_pvid = api.register_data_provider("detecting_status",100, "message", 100,layout_param_data)["pvid"]
            detect_p = Process(target=observe, args=[console_pvid])
            detect_p.start()
            log ("started")
            current_availables[1] = available_mess_detect_off

            api.mod_controller_provider(pvid,
                                             "uvc_cam",
                                             5000,
                                             current_availables,
                                             layout_param_con
                                             )
            log ("modded")
            api.acknowledge(pvid, mess['req_id'], "1", [pvid,console_pvid], [])
            log("ack")

        elif mess["message"] == available_mess_detect_off["message_name"]:
            detect_p.terminate()
            detect_p = None
            api.delete_provider(console_pvid)
            current_availables[1] = available_mess_detect_on
            api.mod_controller_provider(pvid,
                                        "uvc_cam",
                                        5000,
                                        current_availables,
                                        layout_param_con
                                        )
            api.acknowledge(pvid, mess['req_id'], "1", [pvid], [console_pvid])
        elif mess["message"] == available_mess_left["message_name"]:
            py.pwm(30)
            api.acknowledge(pvid, mess['req_id'], "0", [], [])
        elif mess["message"] == available_mess_front["message_name"]:
            py.pwm(80)
            api.acknowledge(pvid, mess['req_id'], "0", [], [])
        elif mess["message"] == available_mess_right["message_name"]:
            py.pwm(130)
            api.acknowledge(pvid, mess['req_id'], "0", [], [])

if data_pv_id <> "":
        stop_process()
        detect_p.terminate()
        api.delete_provider(data_pv_id)
api.delete_provider(pvid)

