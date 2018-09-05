import { resolve } from 'path';

import * as knex from 'knex';

import fetch, { Request, Response } from 'node-fetch';

import { API_ROOT_PATH, DATABASE_KNEX_CONFIG, HOST, PORT, SESSION_NAME } from '../../src/config';

const ROOT_URL = `http://${HOST}:${PORT}${API_ROOT_PATH}`;

const DATABASE_KNEX_TEST_CONFIG = {
  ...DATABASE_KNEX_CONFIG,
  connection: {
    // Override global SQLite3 database file path to be based on current dir.
    filename: resolve(__dirname, '..', '..', 'db', 'database.test.sqlite3'),
  },
  seeds: {
    directory: resolve(__dirname, '..', '..', 'dist', 'seeds'),
  },
};

describe(`join route (${API_ROOT_PATH}/join)`, () => {
  // This cleanup is needed when running Jest with --watchAll.
  afterAll(async () => {
    try {
      const db = await knex(DATABASE_KNEX_TEST_CONFIG);

      await db
        .select()
        .from('users_online')
        .delete();
      await db
        .select()
        .from('sessions')
        .delete();
    } catch (err) {
      expect(err).toBeNull();
      throw err;
    }
  });

  describe('POST', () => {
    const request: Request = new Request(ROOT_URL + '/join', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    it('should add a new nickname to the chatroom', async () => {
      const nickname = 'mockNickname';

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(201);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toMatch(new RegExp(SESSION_NAME));
        expect(respJson).toEqual({ message: 'User session initialized successfully.' });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a adding a nickname that was seeded', async () => {
      const nickname = 'mockSeedNickname';

      try {
        const db = await knex(DATABASE_KNEX_TEST_CONFIG);
        await db.seed.run();

        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({ message: `Nickname "${nickname}" is already in use!` });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a nickname is added twice', async () => {
      const nickname = 'mockDuplicatedNickname';

      try {
        const firstInsertionResp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const firstInsertionRespJson = await firstInsertionResp.json();

        expect(firstInsertionResp.status).toBe(201);
        expect(firstInsertionResp.headers.get('content-type')).toMatch(/application\/json/);
        expect(firstInsertionResp.headers.get('set-cookie')).toMatch(new RegExp(SESSION_NAME));
        expect(firstInsertionRespJson).toEqual({ message: 'User session initialized successfully.' });

        const duplicatedInsertionResp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const duplicatedInsertionRespJson = await duplicatedInsertionResp.json();

        expect(duplicatedInsertionResp.status).toBe(500);
        expect(duplicatedInsertionResp.headers.get('content-type')).toMatch(/application\/json/);
        expect(duplicatedInsertionResp.headers.get('set-cookie')).toBeNull();
        expect(duplicatedInsertionRespJson).toEqual({ message: `Nickname "${nickname}" is already in use!` });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a nickname is empty', async () => {
      const nickname = '';

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({ message: 'Invalid nickname.' });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a nickname is longer than 32 characters', async () => {
      const nickname = 'a'.repeat(33);

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({ message: 'Username must be between 1 and 32 characters.' });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a nickname is using invalid characters', async () => {
      const nickname = '🔥';

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({
          message: 'Invalid characters on nickname, only alphanumeric with no whitespaces are valid.',
        });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when a nickname is using whitespace', async () => {
      const nickname = 'mock nickname';

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify({ nickname }),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({
          message: 'Invalid characters on nickname, only alphanumeric with no whitespaces are valid.',
        });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });

    it('should return 500 when invalid params are passed', async () => {
      const body = {
        invalidParam: 'mockNickname',
      };

      try {
        const resp: Response = await fetch(request, {
          body: JSON.stringify(body),
        });

        const respJson = await resp.json();

        expect(resp.status).toBe(500);
        expect(resp.headers.get('content-type')).toMatch(/application\/json/);
        expect(resp.headers.get('set-cookie')).toBeNull();
        expect(respJson).toEqual({ message: 'Invalid nickname.' });
      } catch (err) {
        expect(err).toBeNull();
        throw err;
      }
    });
  });
});
