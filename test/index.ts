import createLogger from '../src/index';

const logger = createLogger({
    serviceName: 'kuaishou-frontend-live',
    customLevels: ['monitor', 'metrics'],
    debug: true,
});

