# ./mjpg_streamer -i "./input_uvc.so -f 2 -r 320x240 -d /dev/video0 -y" -o "./output_http.so -w ./www -p 8080"



from raspin.logging_service_skelton import logging_service_skelton as skelton
from datetime import datetime 
import subprocess
import time

class uvccam_service(skelton):

    def __init__(self):
        skelton.__init__(self)



    def launch_process(self, data_pvid):

        cmd = ["./mjpg_streamer"
        , "-i"
        , './input_raspicam.so -fps 10 -x 320 -y 240'
        , "-o"
        , './output_http.so -w ./www -p 8080']
        
        self.p = subprocess.Popen(cmd, cwd="/home/pi/bin/programs/camera_inst/mjpg-streamer/mjpg-streamer-experimental")
        # proc.communicate()
        time.sleep(3)
        print("@kidou kanryou")



if __name__ == "__main__":
    service = uvccam_service()
    service.initialize("uvccam", "video")
    service.main_process()


