import raspin.pysical_util as pi

current_duty = 0
def up():
    pass
def down():
    pass

def right():
    global current_duty
    current_duty += 10
    current_duty = min(current_duty , 95)
    current_duty = max(current_duty , 5)
    pi.pwm(current_duty)
def left():
    global current_duty
    current_duty -= 10
    current_duty = min(current_duty , 95)
    current_duty = max(current_duty , 5)
    pi.pwm(current_duty )

def stop():
    current_duty = 5
    pi.pwm(current_duty )

