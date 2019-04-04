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
function createLogger({ serviceName, daysToKeep = 1, logRolling = 'day', defaultLog = {} }) {
    this.serviceName = serviceName;
    this.daysToKeep = daysToKeep;
    this.logRolling = logRolling;
    this.defaultLog = defaultLog;
    const levels = {};
    const levelVal = 100000;
    customLevels.forEach((level, index) => {
        levels[level.toUpperCase()] = {
            value: levelVal * (index + 1),
            colour: 'black;'
        };
    });
    function generateAppender(appenderName = 'common') {
        const appenderNameFile = `${appenderName}File`;
        const dateFileAppender = {
            type: 'dateFile',
            filename: getLogFilename(appenderName === 'common' ? '' : appenderName),
            pattern: this.logRolling === 'day' ? '.yyyy-MM-dd' : '.yyyy-MM-dd-hh',
            daysToKeep: this.daysToKeep,
            layout: {
                type: 'json',
                context: {
                    serviceName: this.serviceName,
                    ...this.defaultLog,
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
            appenderNameFile: appenderName === 'common' ? logLevelFilterAppender : dateFileAppender,
            appenderName: appender,
        };
    }
    const customAppenders = {};
    this.allLevels.map((level) => {
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
                appenders: isProd ? ['out', ...this.allLevels] : ['out'],
                level: 'all',
            },
        },
    });
    const logger = log4js_1.getLogger();
    return logger;
}
exports.default = createLogger;
function getLogFilename(logType = '') {
    const filename = logType ? `${this.serviceName}-${logType}` : `${this.serviceName}`;
    return path_1.default.join(process.cwd(), 'log', `${filename}.log`);
}
