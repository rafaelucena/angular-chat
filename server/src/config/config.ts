// Global app configurations.

import { resolve } from 'path';

// Node environment.
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Default IP Address/hostname.
export const HOST = NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

// Default port.
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8001;

// Winston debug level.
export const DEBUG_LEVEL = NODE_ENV === 'production' ? 'info' : 'debug';

// API paths.
export const API_ROOT_PATH = '/api/v1';
export const API_WS_ROOT_PATH = '/ws';

// Express session.
export const SESSION_SECRET = 'some-secure-string';
export const SESSION_NAME = 'angular-chat-sid';
export const SESSION_MAXAGE = 24 * 60 * 60 * 1000; // Sessions will be stored for 24hours (Value in ms).

// Database configurations.
export const DATABASE_ROOT_DIRECTORY = resolve(__dirname, '..', '..', 'db'); // Path: /db
export const DATABASE_MIGRATION_DIRECTORY = resolve(__dirname, '..', 'migrations'); // Path: /dist/migrations

// This project uses Knex.js (http://knexjs.org) as the db query builder/handler.
export const DATABASE_KNEX_CONFIG = {
  // Debug queries.
  debug: false,

  // SQLite3 is used as the default database.
  // KnexJS supports a multitude of providers, please check http://knexjs.org/#Installation-node if you wish add or modify these values.
  client: 'sqlite3',
  connection: {
    // SQLite database filename.
    filename: resolve(DATABASE_ROOT_DIRECTORY, `database.${NODE_ENV}.sqlite3`),
  },
  loadExtensions: ['.ts', '.js'],

  // SQL migration config, read more at: http://knexjs.org/#Migrations-API
  migrations: {
    directory: DATABASE_MIGRATION_DIRECTORY,
  },

  // Disable warning when initializing SQLite3 DBs (Message: http://knexjs.org/#Builder-insert).
  useNullAsDefault: true,
};
