declare module 'log4js' {
    interface Logger {
        monitor(message: any, ...args: any[]): void;
        metrics(message: any, ...args: any[]): void;
    }
}
declare type LogRolling = 'day' | 'hour';
interface KeyValueMap {
    [key: string]: any;
}
export declare function createLogger({ serviceName, customLevels, daysToKeep, logRolling, debug, defaultLog, singleLogFile, useServiceName, logDir, }: {
    serviceName: string;
    customLevels?: string[];
    daysToKeep?: number;
    logRolling?: LogRolling;
    debug?: boolean;
    defaultLog?: KeyValueMap;
    singleLogFile?: boolean;
    useServiceName?: boolean;
    logDir?: string;
}): import("log4js").Logger;
export default createLogger;
