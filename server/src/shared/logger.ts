import * as Winston from 'winston';

import { DEBUG_LEVEL } from '../config';
import { Timestamp } from '../utils';

export class Logger {
  private static logger: Winston.Logger;

  public static getInstance(): Winston.Logger {
    if (!this.logger) {
      return this.initialize();
    }

    return this.logger;
  }

  private static initialize(): Winston.Logger {
    this.logger = Winston.createLogger({
      format: Winston.format.combine(
        Winston.format.simple(),
        Winston.format.timestamp(),
        Winston.format.colorize(),
        this.winstonFormatting(),
      ),
      level: DEBUG_LEVEL,
      levels: { emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 },
      transports: [new Winston.transports.Console()],
    });

    return this.logger;
  }

  private static winstonFormatting() {
    return Winston.format.printf(info => {
      return `${Timestamp.getFormattedTimestamp(info.timestamp)} ${info.level}: ${info.message}`;
    });
  }

  private constructor() {}
}
