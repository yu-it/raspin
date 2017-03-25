# -*- coding: utf-8 -*-

import time
import numpy
import requests
from PIL import Image
import raspin.my_mailer
from StringIO import StringIO
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

observe()
