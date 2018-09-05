import * as Knex from 'knex';
import { SchemaBuilder } from 'knex';

export function up(db: Knex, Promise: any): Promise<SchemaBuilder> {
  return Promise.resolve(
    db.schema.createTable('users_online', table => {
      table.increments();
      table.string('nickname');
      table.dateTime('created_at');
    }),
  );
}

export function down(db: Knex, Promise: any): Promise<SchemaBuilder> {
  return Promise.resolve(db.schema.dropTableIfExists('users_online'));
}
