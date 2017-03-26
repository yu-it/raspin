import raspin.pysical_util as pi

mortor_0_l = pi.create_pwm(22,50)
mortor_0_r = pi.create_pwm(23,50)
mortor_1_l = pi.create_pwm(24,50)
mortor_1_r = pi.create_pwm(25,50)

power = 50
def up():
    mortor_0_l.set(power)
    mortor_0_r.set(0)
    mortor_1_l.set(power)
    mortor_1_r.set(0)

def down():
    mortor_0_l.set(0)
    mortor_0_r.set(power)
    mortor_1_l.set(0)
    mortor_1_r.set(power)
def right():
    mortor_0_l.set(power)
    mortor_0_r.set(0)
    mortor_1_l.set(0)
    mortor_1_r.set(power)

def left():
    mortor_0_l.set(0)
    mortor_0_r.set(power)
    mortor_1_l.set(power)
    mortor_1_r.set(0)

def stop():
    mortor_0_l.set(0)
    mortor_0_r.set(0)
    mortor_1_l.set(0)
    mortor_1_r.set(0)
