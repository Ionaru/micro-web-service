import { format } from 'util';

import * as debug from 'debug';

export const handleExceptions = (
    gracefulShutdown: () => Promise<void>, shutdown: (code?: number) => void,
): void => {

    process.stdin.resume();
    process.on('unhandledRejection', (reason, p) => {
        process.stderr.write(`Unhandled Rejection at: \nPromise ${format(p)} \nReason: ${format(reason)}\n`);
        gracefulShutdown().then(() => shutdown()).catch(() => shutdown(1));
    });
    process.on('uncaughtException', (error) => {
        process.stderr.write(`Uncaught Exception! \n${format(error)}\n`);
        gracefulShutdown().then(() => shutdown()).catch(() => shutdown(1));
    });
};

export const handleSignals = (
    gracefulShutdown: () => Promise<void>, shutdown: (code?: number) => void, debugLogger?: debug.Debugger,
): void => {
    process.stdin.resume();
    process.on('SIGINT', () => {
        if (debugLogger) {
            debugLogger('SIGINT received.');
        }
        gracefulShutdown().then(() => shutdown()).catch(() => shutdown(1));
    });
    process.on('SIGTERM', () => {
        if (debugLogger) {
            debugLogger('SIGTERM received.');
        }
        gracefulShutdown().then(() => shutdown()).catch(() => shutdown(1));
    });
};
