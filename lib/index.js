"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = require("log4js");
const path_1 = require("path");
const jsonLayout_1 = require("./jsonLayout");
const customLevels = ['monitor', 'metrics'];
const isProd = process.env.NODE_ENV === 'production';
const customLayout = {
    type: 'pattern',
    pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %m',
};
log4js_1.addLayout('json', jsonLayout_1.default);
function createLogger({ serviceName, daysToKeep = 1, logRolling = 'day', debug = false, defaultLog = {} }) {
    const levels = {};
    const levelVal = 100000;
    customLevels.forEach((level, index) => {
        levels[level.toUpperCase()] = {
            value: levelVal * (index + 1),
            colour: 'black',
        };
    });
    function generateAppender(appenderName = 'common') {
        const appenderNameFile = `${appenderName}File`;
        const dateFileAppender = {
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
        const logLevelFilterAppender = {
            type: 'logLevelFilter',
            appender: appenderNameFile,
            level: 'info',
            maxLevel: 'fatal',
        };
        const appender = {
            type: 'logLevelFilter',
            appender: appenderNameFile,
            level: appenderName,
            maxLevel: appenderName,
        };
        return {
            [appenderNameFile]: appenderName === 'common' ? logLevelFilterAppender : dateFileAppender,
            [appenderName]: appender,
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
    log4js_1.configure({
        levels,
        appenders,
        categories: {
            default: {
                appenders: (debug || isProd) ? ['out', ...allLevels] : ['out'],
                level: 'all',
            },
        },
    });
    const logger = log4js_1.getLogger();
    return logger;
}
exports.default = createLogger;
function getLogFilename(serviceName, logType = '') {
    const filename = logType ? `${serviceName}-${logType}` : `${serviceName}`;
    return path_1.join(process.cwd(), 'log', `${filename}.log`);
}
