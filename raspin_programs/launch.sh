mkdir logs
start python physical_driver.py >> logs/physical_driver.log 2>&1
start python uvccam-ex-service.py >> logs/cams.log 2>&1
start python cpu-service.py >> logs/cpus.log 2>&1
start python mem-service.py >> logs/mems.log 2>&1
start python power-service.py >> logs/powers.log 2>&1

