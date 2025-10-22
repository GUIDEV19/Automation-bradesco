export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
}

export class Logger {
  private logs: LogEntry[] = [];
  private onLog?: (log: LogEntry) => void;

  constructor(onLog?: (log: LogEntry) => void) {
    this.onLog = onLog;
  }

  private log(level: LogLevel, message: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
    };

    this.logs.push(entry);
    
    if (this.onLog) {
      this.onLog(entry);
    }

    // Também logar no console
    const timestamp = entry.timestamp.toLocaleTimeString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARNING:
        console.warn(logMessage);
        break;
      case LogLevel.SUCCESS:
        console.log(`%c${logMessage}`, 'color: green');
        break;
      default:
        console.log(logMessage);
    }
  }

  info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  success(message: string) {
    this.log(LogLevel.SUCCESS, message);
  }

  warning(message: string) {
    this.log(LogLevel.WARNING, message);
  }

  error(message: string) {
    this.log(LogLevel.ERROR, message);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

