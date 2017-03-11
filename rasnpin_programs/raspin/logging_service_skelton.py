
# ./mjpg_streamer -i "./input_uvc.so -f 2 -r 320x240 -d /dev/video0 -y" -o "./output_http.so -w ./www -p 8080"
import time
import raspin
from datetime import datetime
from multiprocessing import Process


def timestp():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')


def log(str):
    print("{stp} {str}".format(stp=timestp(), str=str))


class logging_service_skelton:

    def __init__(self):
        self.pvid = ""
        self.p = None


    def initialize(self, pvname, data_type):
        self.pvname = pvname
        self.data_type = data_type
        self.json_stopping = {"pvname": pvname, "queue_size": 5000,
                         "available_message": [{"message_name": "on", "arg_count": 1},
                                               {"message_name": "end_{pvname}_service".format(pvname=pvname),
                                                "arg_count": 1}]}

        self.json_running = {"pvname": pvname, "queue_size": 5000,
                        "available_message": [{"message_name": "off", "arg_count": 1},
                                              {"message_name": "end_{pvname}_service".format(pvname=pvname),
                                               "arg_count": 1}]}
        self.data_pv_json = {"pvname": "{pvname}_streamer".format(pvname = pvname), "queue_size": 5000, "type": data_type}


    def retrieve_value(self):
        raise Exception ("not implemented")

    def subprocess_function(self, data_pvid):
        while True:
            tsp = self.retrieve_value()
            print(tsp)
            raspin.AddOvservationData(data_pvid, tsp)
            time.sleep(1)
            raspin.ping()



    def __launch_process(self, data_pvid):

        self.p = Process(target=self.subprocess_function, args=[data_pvid])
        self.p.start()

    def __stop_process(self):
        self.p.terminate()
        self.p = None



    def main_process(self):

        self.pvid = raspin.RegistControllerProvider(self.json_stopping)
        last_req_id = ""
        data_pv_id = ""
        while True:
            mess = raspin.SubscribeControlMessage(self.pvid, last_req_id, 100)
            log("docs------")
            log(mess)
            if mess is None:
                continue
            last_req_id = mess['req_id']
            if mess["message"] == "end_{pvname}_service".format(pvname=self.pvname):
                raspin.Acknowledge(self.pvid, mess['req_id'], {"ret": "1", "u": [], "d":[self.pvid,data_pv_id ]})
                break
            else:
                log("pvid:{pv},req_id:{req}".format(req=mess['req_id'], pv=self.pvid))
                if self.p is None:
                    data_pv_id = raspin.RegistDataProvider(
                        self.data_pv_json)
                    self.__launch_process(data_pv_id)
                    raspin.ModControllerProvider(self.pvid, self.json_running)
                    raspin.Acknowledge(self.pvid, mess['req_id'], {"ret": "1", "u": [self.pvid,data_pv_id ], "d": []})

                else:
                    raspin.DeleteProvider(data_pv_id)
                    self.__stop_process()
                    raspin.ModControllerProvider(self.pvid, self.json_stopping)
                    raspin.Acknowledge(self.pvid, mess['req_id'], {"ret": "1", "d": [data_pv_id], "u": [self.pvid]})
                    data_pv_id = ""

        if data_pv_id <> "":
            self.__stop_process()
            raspin.DeleteProvider(data_pv_id)
            raspin.DeleteProvider(self.pvid)


