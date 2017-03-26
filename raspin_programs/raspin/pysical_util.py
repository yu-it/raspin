import platform

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
            GPIO.setup(_port, GPIO.OUT)
            self.p = GPIO.PWM(_port, _freq)  # 50hz pwm
            self.p.start(0)

    def set(self, cycle):
        if self.env:
            self.p.ChangeDutyCycle(cycle)
        else:
            print("set duty of {num}, as {duty}".format(num = self.port, duty = cycle))

