# -*- coding: utf-8 -*-

import urllib2
import json
import pymongo

class api:

    #serverにはサーバ名またはIP,portにはポート番号
    def __init__(self, server, port):
        #http://localhost:3000
        self.api_template = "http://{server}:{port}/raspin-api/{query}".format(server=server, port=port)
        self.ping()

    def __call_api_get(self, path):
        return self.__http_get(self.api_template.format(query = path))

    def __http_get(self, url):
        self.__log (url)
        r = urllib2.urlopen(url)
        res = r.read()
        return json.loads(res)

    def __log(message):
        print(message)

    def ping(self):
        try:
            ping = self.__call_api_get("ping")
            self.__log(ping)
        except Exception as ex:
            message = "raspin-api 接続エラーが発生しました。" + str(ex)
            self.__log(message)
            raise Exception(message)

    def subscribe_control_message(self, pvid, timeout_second):

        query = 'SubscribeControlMessage?pvid={pvid}'.format(pvid = pvid)
        try:
            return self.__call_api_get(query)
        except Exception as ex:
            raise ex

    def add_observation_data(self, pvid, data):
        query = 'AddObservationData?pvid={pvid}&data={data}'.format(pvid = pvid, data = data)
        self.__call_api_get(query)

    def register_controller_provider_old(self, json_definition):
        return self.regist_controller_provider(json_definition["pvname"], json_definition["queue_size"], json_definition["available_message"]  )

    def register_controller_provider(self, pv_name, queue_size, available_messages):
        query = "RegisterControllerProvider?pvname={pv_name}&queue_size={queue_size}&".format(pv_name=pv_name,queue_size=queue_size)
        msgs = []
        for message, count in available_messages:
            msgs.append("message_name={message}&arg_count={arg_count}".format(message, count))
        query += "&".join(msgs)
        return self.__call_api_get(query)


    def register_data_provider(self,pvname, queue_size, type):
        query = "RegisterDataProvider?pvname={pv_name}&queue_size={queue_size}&type={type}".format(pv_name=pvname,queue_size=queue_size,type=type)
        return self.__call_api_get(query.format(pv_name=pvname, queue_size=queue_size, type=type))

    def ModControllerProvider(self, pvid, pv_name, queue_size, available_messages):
        query = "ModControllerProvider?pvid={pvid}&pvname={pv_name}&queue_size={queue_size}&".format(pvid=pvid,pv_name=pv_name,queue_size=queue_size)
        msgs = []
        for message, count in available_messages:
            msgs.append("message_name={message}&arg_count={arg_count}".format(message, count))
        query += "&".join(msgs)
        return self.__call_api_get(query)


    def Acknowledge(self,id, req_id, ret, u, d):
        query = "ModControllerProvider?pvid={pvid}&pvname={pv_name}&queue_size={queue_size}&".format(pvid=pvid,pv_name=pv_name,queue_size=queue_size)
        return self.__call_api_get(query)


    def DeleteProvider(pvid):
        db.system_js.DeleteProvider(pvid)