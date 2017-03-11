from raspin.logging_service_skelton import logging_service_skelton as skelton
from datetime import datetime 


class timer_service(skelton):

    def __init__(self):
        skelton.__init__(self)

    def retrieve_value(self):
        return datetime.now().strftime("%Y/%m/%d %H:%M:%S")


if __name__ == "__main__":
    service = timer_service()
    service.initialize("time", "message")
    service.main_process()


