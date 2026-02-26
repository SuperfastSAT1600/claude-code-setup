/**
 * Simple logger utility for the blog agent system
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[${LogLevel.DEBUG}] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[${LogLevel.INFO}] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[${LogLevel.WARN}] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[${LogLevel.ERROR}] ${new Date().toISOString()} - ${message}`, error);
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}
