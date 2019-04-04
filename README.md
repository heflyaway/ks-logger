# ks-logger
web直播使用的日志模块，封装自[log4js](https://github.com/log4js-node/log4js-node)

除了log4js原有的日志，增加了自定义的monitor metrics等日志

自定义的日志格式都会打到项目目录下的同名文件

日志会默认带上serviceName, level, date, time, pid

使用方法
```javascript
    import createLogger from '@ks/log4js';
    const logger = createLogger({
        serviceName: 'kuaishou-frontend-live',
        // 日志在生产环境会写入文件，其他环境输出到stdout
        // 在开发模式下如果要写入文件，可以这样
        debug: true,
    });
```
