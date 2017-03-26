# -*- coding: utf-8 -*-
import platform
def log(str):
    print(str)



# ピンの名前を変数として定義
SPICLK = 11
SPIMOSI = 10
SPIMISO = 9
SPICS = 8

if platform.system() == "Windows":
    do_drive = False
    print("run as emu")
else:
    do_drive = True
    print("run actually")
    import RPi.GPIO as GPIO
    GPIO.setmode(GPIO.BCM)
    # SPI通信用の入出力を定義
    GPIO.setup(SPICLK, GPIO.OUT)
    GPIO.setup(SPIMOSI, GPIO.OUT)
    GPIO.setup(SPIMISO, GPIO.IN)
    GPIO.setup(SPICS, GPIO.OUT)


def readadc(adcnum, clockpin, mosipin, misopin, cspin):
    if adcnum > 7 or adcnum < 0:
        return -1
    GPIO.output(cspin, GPIO.HIGH)
    GPIO.output(clockpin, GPIO.LOW)
    GPIO.output(cspin, GPIO.LOW)

    commandout = adcnum
    commandout |= 0x18  # スタートビット＋シングルエンドビット
    commandout <<= 3  # LSBから8ビット目を送信するようにする
    for i in range(5):
        # LSBから数えて8ビット目から4ビット目までを送信
        if commandout & 0x80:
            GPIO.output(mosipin, GPIO.HIGH)
        else:
            GPIO.output(mosipin, GPIO.LOW)
        commandout <<= 1
        GPIO.output(clockpin, GPIO.HIGH)
        GPIO.output(clockpin, GPIO.LOW)
    adcout = 0
    # 13ビット読む（ヌルビット＋12ビットデータ）
    for i in range(13):
        GPIO.output(clockpin, GPIO.HIGH)
        GPIO.output(clockpin, GPIO.LOW)
        adcout <<= 1
        if i > 0 and GPIO.input(misopin) == GPIO.HIGH:
            adcout |= 0x1
    GPIO.output(cspin, GPIO.HIGH)
    return adcout






def read_analog(ch):
    readadc(ch, SPICLK, SPIMOSI, SPIMISO, SPICS)


def create_pwm(port, freq):
    return pwm_port(do_drive, port, freq)


def clear():
    if do_drive:
        GPIO.cleanup()
        GPIO.setmode(GPIO.BCM)
    else:
        log("cleanup")

class pwm_port:
    def __init__(self, _env, _port, _freq):
        self.env = _env
        self.port = _port
        if _env:
            log("setup pysical info")
            GPIO.setup(_port, GPIO.OUT)
            self.p = GPIO.PWM(_port, _freq)  # 50hz pwm
            self.p.start(0)
        else:
            log("is emu mode")


    def set(self, cycle):
        if self.env:
            log("actually set duty of {num}, as {duty}".format(num = self.port, duty = cycle))
            self.p.ChangeDutyCycle(cycle)
        else:
            log("set duty of {num}, as {duty}".format(num = self.port, duty = cycle))

