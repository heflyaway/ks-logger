import {
    configure,
    getLogger,
    addLayout,
    DateFileAppender,
    LogLevelFilterAppender,
} from 'log4js';
import { join } from 'path';
import { jsonLayout } from './jsonLayout';

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
interface KeyValueMap {
    [key: string]: any
}

export function createLogger({
    serviceName,
    customLevels = [],
    daysToKeep = 1, // 日志文件保留天数
    logRolling = 'day', // 日志切割方式 按天或者按小时
    debug = false, // debug模式下, 日志会写入文件
    defaultLog = {}, // 业务传入的默认日志
    singleLogFile = false, // 单文件模式, 所有日志写入同一个文件
    useServiceName = true, // 日志名带上serviceName, 这在多个项目混合部署的时候可以区分日志文件
    logDir = '', // 日志文件目录
}: {
    serviceName: string,
    customLevels?: string[],
    daysToKeep?: number,
    logRolling?: LogRolling,
    debug?: boolean,
    defaultLog?: KeyValueMap,
    singleLogFile?: boolean,
    useServiceName?: boolean,
    logDir?: string,
}) {
    // customLevels value大于FATAL 小于MARK
    const levels: object = {};
    const levelVal = 100000;
    customLevels.forEach((level, index) => {
        levels[level.toUpperCase()] = {
            value: levelVal * (index + 1),
            colour: 'black',
        }
    });

    // 生成Appender
    function generateAppender(appenderName: string = 'common') {
        const appenderNameFile = `${appenderName}File`;
        const dateFileAppender: DateFileAppender = {
            type: 'dateFile',
            filename: getLogFilename({
                serviceName,
                appenderName,
                singleLogFile,
                useServiceName,
                logDir,
            }),
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
            [appenderNameFile]: dateFileAppender,
            [appenderName]: appenderName === 'common' ? logLevelFilterAppender : appender,
        };
    }

    const allLevels = [
        'common',
        ...customLevels,
    ];

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

    // @ts-ignore
    configure({
        levels,
        appenders,
        categories: {
            default: {
                appenders: (debug || isProd) ? ['out', ...allLevels] : ['out'],
                level: 'all',
            },
        },
    });

    const logger = getLogger();

    return logger;
}

export default createLogger;

// 生成日志文件
function getLogFilename({
    serviceName,
    appenderName,
    singleLogFile,
    useServiceName,
    logDir,
}: {
    serviceName: string,
    appenderName: string,
    singleLogFile: boolean,
    useServiceName: boolean,
    logDir: string,
}) {
    // 如果不指定logDir, 则默认为根目录下log文件夹
    const logPath = logDir || join(process.cwd(), 'log');
    let filename = 'common';
    if (useServiceName) {
        filename = `${serviceName}-${singleLogFile ? 'common' : appenderName}`;
    } else {
        filename = `${singleLogFile ? 'common' : appenderName}`;
    }
    return join(logPath, `${filename}.log`);
}
