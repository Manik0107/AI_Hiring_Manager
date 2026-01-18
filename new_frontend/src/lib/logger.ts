
const LOG_PREFIX = '[AI Hiring Manager]';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
    private log(level: LogLevel, message: string, ...args: any[]) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `${LOG_PREFIX} [${timestamp}]`;
        const color = this.getColor(level);

        if (level === 'error') {
            console.error(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`, ...args);
        } else if (level === 'warn') {
            console.warn(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`, ...args);
        } else {
            console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`, ...args);
        }
    }

    private getColor(level: LogLevel): string {
        switch (level) {
            case 'info': return '#3b82f6'; // blue-500
            case 'warn': return '#f59e0b'; // amber-500
            case 'error': return '#ef4444'; // red-500
            case 'debug': return '#6b7280'; // gray-500
            default: return 'inherit';
        }
    }

    info(message: string, ...args: any[]) {
        this.log('info', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log('warn', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log('error', message, ...args);
    }

    debug(message: string, ...args: any[]) {
        this.log('debug', message, ...args);
    }
}

export const logger = new Logger();
