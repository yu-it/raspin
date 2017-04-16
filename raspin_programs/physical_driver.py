import raspin.raspin
import re
import physical_driver_impl as driver
api = raspin.raspin.api("localhost", 3000)

available_mess_mv = {"message_name": "Move", "arg": "dir_uldr", "layout_param": "default-controller@controller"}
available_mess_Speed = {"message_name": "Speed", "arg": "dir_ud", "layout_param": "default-controller@controller"}
available_mess_Arm1 = {"message_name": "Arm1", "arg": "dir_ud", "layout_param": "default-controller@controller"}
available_mess_Arm2 = {"message_name": "Arm2", "arg": "dir_ud", "layout_param": "default-controller@controller"}
available_mess_kill = {"message_name": "Kill", "arg": "0", "layout_param": "default-controller@controller"}
available_mess_stop_all = {"message_name": "Stop All", "arg": "0", "layout_param": "default-controller@controller"}

pvid = api.register_controller_provider("Physical Control", 3000, [available_mess_mv, available_mess_Speed ,available_mess_Arm1, available_mess_Arm2, available_mess_kill, available_mess_stop_all])["pvid"]
while True:
    mess = api.subscribe_control_message(pvid,120)
    if mess["ret"] == "to":
        print("timeout")
        continue
    if mess["message"] == available_mess_mv["message_name"]:
        if mess["arg"] == u"u_p":
            driver.forward()
        elif mess["arg"] == u"d_p":
            driver.back()
        elif mess["arg"] == u"r_p":
            driver.right_turn()
        elif mess["arg"] == u"l_p":
            driver.left_turn()
        elif re.match(r".+_r", mess["arg"]):
            driver.stop()
    elif mess["message"] == available_mess_Speed["message_name"]:
        if mess["arg"] == u"u_p":
            driver.speed_up()
        elif mess["arg"] == u"d_p":
            driver.speed_down()
    elif mess["message"] == available_mess_Arm1["message_name"]:
        if mess["arg"] == u"u_p":
            driver.up_arm1()
        elif mess["arg"] == u"d_p":
            driver.down_arm1()
        elif re.match(r".+_r", mess["arg"]):
            driver.stop_arm1()
    elif mess["message"] == available_mess_Arm2["message_name"]:
        if mess["arg"] == u"u_p":
            driver.up_arm2()
        elif mess["arg"] == u"d_p":
            driver.down_arm2()
        elif re.match(r".+_r", mess["arg"]):
            driver.stop_arm2()
    elif mess["message"] == available_mess_kill["message_name"]:
        driver.stop()
        driver.stop_arm1()
        driver.stop_arm2()
        api.acknowledge(pvid, mess["req_id"], "1", [], [pvid])
        break
    elif mess["message"] == available_mess_stop_all["message_name"]:
        driver.stop()
        driver.stop_arm1()
        driver.stop_arm2()
    api.acknowledge(pvid, mess["req_id"],0,[],[])

api.delete_provider(pvid)
