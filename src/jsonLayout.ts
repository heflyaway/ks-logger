import {LoggingEvent} from 'log4js';
import {format} from 'date-fns';
import {isPlainObject} from 'lodash';
import stringifySafe from 'fast-safe-stringify';

function formatUTCDate(date: Date) {
    return format(new Date(date), 'yyyy-MM-DD HH:mm:ss.SSS');
}

// 日志转json
export function jsonLayout(config: any) {
    return (logEvent: LoggingEvent) => {
        const logMessage = Array.isArray(logEvent.data) ? logEvent.data : [logEvent.data];
        let message = {};
        // 如果logMessage是对象, 则展开一层, 否则放在data字段下透传
        if (isPlainObject(logMessage[0])) {
            message = {
                ...logMessage[0],
            };
        } else {
            message = {
                data: logMessage[0],
            };
        }
        const logData = {
            ...logEvent.context,
            ...(config.context || {}),
            date: formatUTCDate(logEvent.startTime),
            // @ts-ignore
            level: logEvent.level.levelStr || '',
            pid: logEvent.pid,
            time: Date.now(),
            ...message,
        };
        try {
            return JSON.stringify(logData);
        } catch (e) {
            return stringifySafe({
                ...logData,
                error: `ERROR CONVERTING LOG MESSAGE TO JSON: ${e.message}`
            });
        }
    };
}
