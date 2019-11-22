"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
const fast_safe_stringify_1 = __importDefault(require("fast-safe-stringify"));
function formatUTCDate(date) {
    return date_fns_1.format(new Date(date), 'yyyy-MM-DD HH:mm:ss.SSS');
}
function jsonLayout(config) {
    return (logEvent) => {
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
        try {
            return JSON.stringify(logData);
        }
        catch (e) {
            return fast_safe_stringify_1.default({
                ...logData,
                error: `ERROR CONVERTING LOG MESSAGE TO JSON: ${e.message}`
            });
        }
    };
}
exports.jsonLayout = jsonLayout;
