import raspin.pysical_util as pu
ADDRESS_PIC = 0x12
COM_SET_SERVO1_MIN = 0x01
COM_SET_SERVO1_MAX = 0x02
COM_MOV_SERVO1 = 0x05
COM_SET_SERVO1_POW = 0x07


COM_SET_SERVO2_MIN = 0x03
COM_SET_SERVO2_MAX = 0x04
COM_MOV_SERVO2 = 0x06
COM_SET_SERVO2_POW = 0x08

COM_SET_MORTOR1_DIR = 0x09
COM_SET_MORTOR2_DIR = 0x0a

COM_SET_MORTOR_POW = 0x0b

CON_MORTOR_MAX_POWER = 820
CON_POWER_STEP = 5
CON_MORTOR_POWERS = [x * (CON_MORTOR_MAX_POWER / CON_POWER_STEP) for x in xrange(CON_POWER_STEP)]
CON_SG92R_MIN_ANGLE = [0xf0, 0x00]
CON_SG92R_MAX_ANGLE = [0xff, 0x03]
CON_SG92R_POWER_MODERATE = [0x0d, 0x00]
CON_SG92R_POWER_FAST = [0x03, 0x00]

CON_UP = [0x03,0x00]
CON_MIDDLE = [0x02,0x00]
CON_DOWN = [0x01,0x00]

current_gear = 3


def as_array(val):
    return [val & 0b0011111111, val & 0b1100000000 >> 7]

def init_pysical_status():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO1_MAX, CON_SG92R_MAX_ANGLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO2_MAX, CON_SG92R_MAX_ANGLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO1_MIN, CON_SG92R_MIN_ANGLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO2_MIN, CON_SG92R_MIN_ANGLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO1_POW, CON_SG92R_POWER_MODERATE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_SERVO2_POW, CON_SG92R_POWER_MODERATE))

    global current_gear
    current_gear = CON_POWER_STEP / 2
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR_POW,as_array(CON_MORTOR_POWERS[current_gear])))

    pass


def com_and_data(com, data):
    ret = [com]
    ret.extend(data)
    return ret

def forward():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR1_DIR, CON_UP))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR2_DIR, CON_UP))


def back():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR1_DIR, CON_DOWN))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR2_DIR, CON_DOWN))
def right_turn():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR1_DIR, CON_UP))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR2_DIR, CON_DOWN))
def left_turn():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR1_DIR, CON_DOWN))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR2_DIR, CON_UP))
def speed_up():
    global current_gear
    current_gear = min(CON_POWER_STEP, current_gear + 1)
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR_POW,as_array(CON_MORTOR_POWERS[current_gear])))
def speed_down():
    global current_gear
    current_gear = max(1, current_gear - 1)
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR_POW,as_array(CON_MORTOR_POWERS[current_gear])))
def stop():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR1_DIR, CON_MIDDLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_SET_MORTOR2_DIR, CON_MIDDLE))
def up_arm1():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_UP))
    pass
def down_arm1():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_DOWN))
    pass
def stop_arm1():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_MIDDLE))
    pass
def up_arm2():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO2, CON_UP))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_DOWN))
    pass
def down_arm2():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO2, CON_DOWN))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_UP))
    pass
def stop_arm2():
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO1, CON_MIDDLE))
    pu.i2c_write(ADDRESS_PIC, com_and_data(COM_MOV_SERVO2, CON_MIDDLE))
    pass
