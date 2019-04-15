"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
function formatUTCDate(date) {
    return date_fns_1.format(new Date(date), 'YYYY-MM-DD HH:mm:ss.SSS');
}
function jsonLayout(config) {
    return (logEvent) => {
        try {
            const logMessage = Array.isArray(logEvent.data) ? logEvent.data : [logEvent.data];
            let message = {};
            if (lodash_1.isPlainObject(logMessage[0])) {
                message = {
                    ...logMessage[0],
                };
            }
            else {
                message = {
                    data: logMessage[0],
                };
            }
            const logData = {
                ...logEvent.context,
                ...(config.context || {}),
                date: formatUTCDate(logEvent.startTime),
                level: logEvent.level.levelStr || '',
                pid: logEvent.pid,
                time: Date.now(),
                ...message,
            };
            return JSON.stringify(logData);
        }
        catch (e) {
            return JSON.stringify({
                error: `ERROR CONVERTING LOG MESSAGE TO JSON: ${e.message}`
            });
        }
    };
}
exports.jsonLayout = jsonLayout;
