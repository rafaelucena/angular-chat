import * as Knex from 'knex';

import { DATABASE_KNEX_CONFIG } from '../config';

export class Database {
  private static databaseConnection: Knex;

  public static async getInstance(): Promise<Knex> {
    if (!this.databaseConnection) {
      return await this.initialize();
    }
    return this.databaseConnection;
  }

  private static async initialize(): Promise<Knex> {
    const db = await Knex(DATABASE_KNEX_CONFIG);
    await db.migrate.latest();

    this.databaseConnection = db;

    return db;
  }

  private constructor() {}
}
