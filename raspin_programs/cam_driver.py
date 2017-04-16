import raspin.raspin
import cam_driver_movement_impl as driver
import os

api = raspin.raspin.api("localhost", 3000)

available_mess_dir = {"message_name": "Move", "arg": "dir_"}
available_mess_stop = {"message_name": "Stop", "arg": "0"}
available_mess_kill = {"message_name": "Kill", "arg": "0"}

pvid = api.register_controller_provider("Cam Driver", 3000, [available_mess_dir, available_mess_stop, available_mess_kill])["pvid"]
while True:
    mess = api.subscribe_control_message(pvid,120)
    if mess["ret"] == "to":
        print("timeout")
        continue
    if mess["message"] == available_mess_dir["message_name"]:
        if mess["arg"] == u"u":
            #driver.up()
            pass
        elif mess["arg"] == u"d":
            #driver.down()
            pass
        elif mess["arg"] == u"r":
            driver.right()
        elif mess["arg"] == u"l":
            driver.left()
    elif mess["message"] == available_mess_stop["message_name"]:
        driver.stop()
    elif mess["message"] == available_mess_kill["message_name"]:
        driver.stop()
        api.acknowledge(pvid, mess["req_id"], "1", [], [pvid])
        break
    api.acknowledge(pvid, mess["req_id"],0,[],[])


api.delete_provider(pvid)
