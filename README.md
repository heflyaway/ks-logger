# ks-logger
web直播使用的日志模块，封装自[https://github.com/log4js-node/log4js-node](log4js)
除了log4js原有的日志，增加了自定义的monitor metrics等日志
自定义的日志格式都会打到同名文件
日志会默认带上serviceName, level, date, time, pid
