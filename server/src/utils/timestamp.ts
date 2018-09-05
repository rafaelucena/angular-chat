import { default as Chalk } from 'chalk';

export class Timestamp {
  public static getFormattedTimestamp(date?: string): string {
    const tempDate = date ? new Date(Date.parse(date)) : new Date();
    const day = tempDate.toLocaleDateString();
    const hour = tempDate.toLocaleTimeString();

    return `[${Chalk.cyan(`${day} ${hour}`)}]`;
  }
}
