from raspin.logging_service_skelton import logging_service_skelton as skelton
import psutil


class mem_service(skelton):

    def __init__(self):
        skelton.__init__(self)

    def retrieve_value(self):
        return psutil.virtual_memory().percent


if __name__ == "__main__":
    service = mem_service()
    service.initialize("memory-usage", "num", "%")
    service.main_process()


