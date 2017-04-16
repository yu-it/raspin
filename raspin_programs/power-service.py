from raspin.logging_service_skelton import logging_service_skelton as skelton
import psutil
import raspin.pysical_util as pys

class power_service(skelton):

    def __init__(self):
        skelton.__init__(self)

    def retrieve_value(self):
        return round(pys.read_analog_volt(0, 3),2)


if __name__ == "__main__":
    service = power_service()
    service.initialize("power", "num", "v")
    service.main_process()


