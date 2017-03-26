import raspin.pysical_util as pi
from multiprocessing import Process, Value

p = None
current_duty = 0
direction = 0
num = Value('d', 0.0)
def move(initial, direction):
    while True:
        initial.value += direction
        pi.pwm(initial.value)


def up():
    pass
def down():
    pass

def right():
    global p, num
    if p <> None:
        p.terminate()
    p = Process(target=move, args=[num, 0.01])
    p.start()
def left():
    global p, num
    if p <> None:
        p.terminate()
    p = Process(target=move, args=[num, -0.01])
    p.start()

def stop():
    if p <> None:
        p.terminate()
