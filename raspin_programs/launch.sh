mkdir logs
nohup sudo python physical_driver.py >> logs/physical_driver.log &
nohup sudo python uvccam-ex-service.py >> logs/cams.log &
nohup sudo python cpu-service.py >> logs/cpus.log &
nohup sudo python mem-service.py >> logs/mems.log &
nohup sudo python power-service.py >> logs/powers.log &

