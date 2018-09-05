import * as Knex from 'knex';
import { SchemaBuilder } from 'knex';

export function up(db: Knex, Promise: any): Promise<SchemaBuilder> {
  return Promise.resolve(
    db.schema.createTable('chat_log', table => {
      table.increments();
      table.string('nickname');
      table.string('message');
      table.dateTime('created_at');
    }),
  );
}

export function down(db: Knex, Promise: any): Promise<SchemaBuilder> {
  return Promise.resolve(db.schema.dropTableIfExists('chat_log'));
}
