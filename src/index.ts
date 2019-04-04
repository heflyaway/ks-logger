import {configure,
    getLogger,
    addLayout,
    DateFileAppender,
    LogLevelFilterAppender,
} from 'log4js';
import path from 'path';
import jsonLayout from './jsonLayout';
const debug = require('debug')('log4js');

// 自定义日志级别
const customLevels = ['monitor', 'metrics'];
// 写在typings里面会覆盖模块自带的d.ts文件...
declare module 'log4js' {
    export interface Logger {
        monitor(message: any, ...args: any[]): void;
        metrics(message: any, ...args: any[]): void;
    }
}

const isProd = process.env.NODE_ENV === 'production';

const customLayout = {
    type: 'pattern',
    pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m',
};

addLayout('json', jsonLayout);

type LogRolling = 'day' | 'hour';
interface DefaultLog {
    [key: string]: any
}

export default function createLogger({
    serviceName,
    daysToKeep = 1, // 日志文件保留天数
    logRolling = 'day', // 日志切割方式 按天或者按小时
    defaultLog = {}
}: {
    serviceName: string,
    daysToKeep?: number,
    logRolling?: LogRolling,
    defaultLog?: DefaultLog,
}) {
    // customLevels value大于FATAL 小于MARK
    const levels: object = {};
    const levelVal = 100000;
    customLevels.forEach((level, index) => {
        levels[level.toUpperCase()] = {
            value: levelVal * (index + 1),
            colour: 'black;'
        }
    });

    // 生成Appender
    function generateAppender(appenderName: string = 'common') {
        const appenderNameFile = `${appenderName}File`;
        const dateFileAppender: DateFileAppender = {
            type: 'dateFile',
            filename: getLogFilename(serviceName, appenderName === 'common' ? '' : appenderName),
            pattern: logRolling === 'day' ? '.yyyy-MM-dd' : '.yyyy-MM-dd-hh',
            daysToKeep,
            layout: {
                type: 'json',
                context: {
                    serviceName,
                    ...defaultLog,
                },
            },
        };
        // common appender会把在info至fatal之间的日志将被写入文件
        const logLevelFilterAppender: LogLevelFilterAppender = {
            type: 'logLevelFilter',
            appender: appenderNameFile,
            level: 'info',
            maxLevel: 'fatal',
        };
        const appender: LogLevelFilterAppender = {
            type: 'logLevelFilter',
            appender: appenderNameFile,
            level: appenderName,
            maxLevel: appenderName,
        };
        return {
            appenderNameFile: appenderName === 'common' ? logLevelFilterAppender : dateFileAppender,
            appenderName: appender,
        };
    }

    const allLevels = [
        'common',
        ...customLevels,
    ]
    const customAppenders = {};
    allLevels.map((level) => {
        Object.assign(customAppenders, generateAppender(level));
    });

    const appenders = {
        out: {
            type: 'stdout',
            layout: customLayout,
        },
        ...customAppenders,
    };

    debug(appenders);

    configure({
        // @ts-ignore
        levels,
        appenders,
        categories: {
            default: {
                appenders: isProd ? ['out', this.allLevels] : ['out'],
                level: 'all',
            },
        },
    });

    const logger = getLogger();

    return logger;
}

function getLogFilename(serviceName: string, logType: string = '') {
    const filename = logType ? `${serviceName}-${logType}` : `${serviceName}`;
    return path.join(process.cwd(), 'log', `${filename}.log`);
}
