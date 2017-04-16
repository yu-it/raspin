mkdir logs
nohup sudo python physical_driver.py >> logs/physical_driver.log 2>&1
nohup sudo python uvccam-ex-service.py >> logs/cams.log 2>&1
nohup sudo python cpu-service.py >> logs/cpus.log 2>&1
nohup sudo python mem-service.py >> logs/mems.log 2>&1
nohup sudo python power-service.py >> logs/powers.log 2>&1

