import { LoggingEvent } from 'log4js';
export default function jsonLayout(config: any): (logEvent: LoggingEvent) => string;
