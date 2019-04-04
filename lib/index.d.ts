declare module 'log4js' {
    interface Logger {
        monitor(message: any, ...args: any[]): void;
        metrics(message: any, ...args: any[]): void;
    }
}
declare type LogRolling = 'day' | 'hour';
interface DefaultLog {
    [key: string]: any;
}
export default function createLogger({ serviceName, daysToKeep, logRolling, debug, defaultLog }: {
    serviceName: string;
    daysToKeep?: number;
    logRolling?: LogRolling;
    debug?: boolean;
    defaultLog?: DefaultLog;
}): import("log4js").Logger;
export {};
