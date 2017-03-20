# -*- coding: utf-8 -*-
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

p = None
detect_p = None

available_mess_cam_on = {"message_name": "on", "arg": 1}
available_mess_cam_off = {"message_name": "off", "arg": 1}
available_mess_detect_on = {"message_name": "detect_move", "arg": 1}
available_mess_detect_off = {"message_name": "no_detecting", "arg": 1}
current_availables = [available_mess_cam_on, available_mess_detect_on]
layout_param_con = "default-controller@command console"


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
        , './input_uvc.so -f 10 -r 320x240 -d /dev/video0 -y'
        , "-o"
        , './output_http.so -w ./www -p 8080']

    p = subprocess.Popen(cmd, cwd="/home/pi/bin/programs/camera_inst/mjpg-streamer/mjpg-streamer")
    # proc.communicate()
    time.sleep(3)
    print("@kidou kanryou")


def http_get(url):
    res = requests.get(url)
    return res.content

def observe():
    print("1")
    img1 = Image.open(StringIO(http_get("http://localhost:8080/?action=snapshot")))
    while True:
        data1 = numpy.array(img1)
        time.sleep(1)
        img2 = Image.open(StringIO(http_get("http://localhost:8080/?action=snapshot")))
        data2 = numpy.array(img2)
        sum = numpy.sum(numpy.sqrt((data1 - data2) ** 2))
        print(sum)
        if sum > 1500000:
            print("stranger")
            img2.save("./stranger.jpeg")
            raspin.my_mailer.send_mail_with_picture("fwje7971@hotmail.com", "detect stranger", "怪しい人物を見かけました。", "./stranger.jpeg")
        else:
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
                                                    "default-data@basic data")["pvid"]
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

            detect_p = Process(target=observe)
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
            api.acknowledge(pvid, mess['req_id'], "1", [pvid], [])
            log("ack")

        elif mess["message"] == available_mess_detect_off["message_name"]:
            detect_p.terminate()
            detect_p = None

            current_availables[1] = available_mess_detect_on
            api.mod_controller_provider(pvid,
                                        "uvc_cam",
                                        5000,
                                        current_availables,
                                        layout_param_con
                                        )
            api.acknowledge(pvid, mess['req_id'], "1", [pvid], [])

    if data_pv_id <> "":
        stop_process()
        detect_p.terminate()
        api.delete_provider(data_pv_id)
    api.delete_provider(pvid)

