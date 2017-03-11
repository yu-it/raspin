# -*- coding: utf-8 -*-

import urllib2
import json
import pymongo

client = pymongo.MongoClient('localhost', 27017)
db = client.test
api_template = "http://localhost:3000/raspin-api/{query}"


def ping():
    try:
        ping = call_api_get("ping")
        log(ping)
    except Exception as ex:
        message = "raspin-api 接続エラーが発生しました。" + str(ex)
        log(message)
        raise Exception(message)


def log(message):
    print(message)


def httpget(url):
    log (url)
    r = urllib2.urlopen(url)
    res = r.read()
    return json.loads(res)


def call_api_get(path):
    return httpget(api_template.format(query = path))

ping()

def SubscribeControlMessage(pvid, previous_processed_req_id, timeout_second):

    query = 'SubscribeControlMessage?pvid={pvid}&previous_processed_req_id={ppreq}'.format(pvid = pvid, ppreq = previous_processed_req_id)
    r = None
    try:
        return call_api_get(query)
    except Exception as ex:
        raise ex
    finally:
        if r <> None:
            r.close()

def AddOvservationData(pvid, data):
    db.system_js.AddOvservationData(pvid, data)
def RegistControllerProvider(json_definition):
    return db.system_js.RegistControllerProvider(json_definition)

def RegistDataProvider(json_definition):
    return db.system_js.RegistDataProvider(json_definition)

def ModControllerProvider(id, json_definition):
    db.system_js.ModControllerProvider(id, json_definition)

def Acknowledge(id, req_id, tag):
    db.system_js.Acknowledge(id, req_id, tag)

def DeleteProvider(pvid):
    db.system_js.DeleteProvider(pvid)