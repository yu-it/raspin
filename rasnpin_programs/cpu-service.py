from raspin.logging_service_skelton import logging_service_skelton as skelton
import psutil


class cpu_service(skelton):

    def __init__(self):
        skelton.__init__(self)

    def retrieve_value(self):
        return psutil.cpu_percent()


if __name__ == "__main__":
    service = cpu_service()
    service.initialize("cpu-usage", "num", "%")
    service.main_process()


