import platform
def log(str):
    print(str)

if platform.system() == "Windows":
    do_drive = False
    print("run as emu")
else:
    do_drive = True
    print("run actually")
    import RPi.GPIO as GPIO
    GPIO.setmode(GPIO.BCM)


def create_pwm(port, freq):
    return pwm_port(do_drive, port, freq)


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

