import { resolve } from 'path';

import * as knex from 'knex';
import * as WebSocket from 'ws';

import fetch, { Response } from 'node-fetch';

import {
  API_ROOT_PATH,
  API_WS_ROOT_PATH,
  DATABASE_KNEX_CONFIG,
  HOST,
  PORT,
  SESSION_NAME,
} from '../../src/config';
import { IFormattedChatMessage } from '../../src/models';

const ROOT_URL = `http://${HOST}:${PORT}${API_ROOT_PATH}`;
const ROOT_WS_URL = `ws://${HOST}:${PORT}${API_ROOT_PATH}${API_WS_ROOT_PATH}`;

const DATABASE_KNEX_TEST_CONFIG = {
  ...DATABASE_KNEX_CONFIG,
  connection: {
    // Override global SQLite3 database file path to be based on current dir.
    filename: resolve(__dirname, '..', '..', 'db', 'database.test.sqlite3'),
  },
};

describe(`websockets route (${API_ROOT_PATH}/ws/chat)`, () => {
  // This cleanup is needed when running Jest with --watchAll.
  afterAll(async () => {
    try {
      const db = await knex(DATABASE_KNEX_TEST_CONFIG);

      await db
        .select()
        .from('chat_log')
        .delete();
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

  async function initializeSession(nickname: string): Promise<string> {
    try {
      const resp: Response = await fetch(ROOT_URL + '/join', {
        body: JSON.stringify({ nickname }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const authCookie = resp.headers.get('set-cookie');

      expect(resp.headers.get('set-cookie')).toMatch(new RegExp(SESSION_NAME));

      return authCookie!;
    } catch (err) {
      expect(err).toBeNull();
      throw err;
    }
  }

  it('should join the chatroom', async () => {
    const authCookie = await initializeSession('mockNicknameJoin');

    const ws = new WebSocket(ROOT_WS_URL + '/chat', [], {
      headers: {
        Cookie: authCookie,
      },
    });

    const mockCallback = jest.fn(() => {
      expect(mockCallback).toBeCalled();
      ws.close();
    });

    ws.on('open', mockCallback);

    ws.on('error', err => {
      expect(err).toBeNull();
      ws.close();
      throw err;
    });
  });

  it('should receive latest messages from the chatroom', async () => {
    const authCookie = await initializeSession('mockNicknameLatestMessages');

    const ws = new WebSocket(ROOT_WS_URL + '/chat', [], {
      headers: {
        Cookie: authCookie,
      },
    });

    ws.on('message', (message: string) => {
      let parsedMessage: IFormattedChatMessage[] = [];

      try {
        parsedMessage = JSON.parse(message);
      } catch (err) {
        expect(err).toBeNull();
      }

      parsedMessage.forEach(chatMessage => {
        expect(chatMessage.date).toBeDefined();
        expect(chatMessage.message).toBeDefined();
        expect(chatMessage.nickname).toBeDefined();
      });

      ws.close();
    });

    ws.on('error', err => {
      expect(err).toBeNull();
      ws.close();
      throw err;
    });
  });

  it('should send a message to the chatroom', async () => {
    const authCookie = await initializeSession('mockNicknameChat');

    const ws = new WebSocket(ROOT_WS_URL + '/chat', [], {
      headers: {
        Cookie: authCookie,
      },
    });

    ws.on('open', () => {
      ws.send(JSON.stringify({ message: 'Hello from testing.' }), (err: Error) => {
        if (err) {
          expect(err).toBeNull();
          ws.close();
          throw err;
        }
      });
    });

    ws.on('message', (message: string) => {
      let parsedMessage: IFormattedChatMessage[] = [];

      try {
        parsedMessage = JSON.parse(message);
      } catch (err) {
        expect(err).toBeNull();
      }

      // Skip chat joining messages.
      if (parsedMessage.length > 1) {
        return;
      }

      const isServerWelcomeMessage = parsedMessage.filter(
        (chatMessage: IFormattedChatMessage) => chatMessage.nickname === 'Angular Chat',
      );

      if (isServerWelcomeMessage) {
        return;
      }

      parsedMessage.forEach((chatMessage: IFormattedChatMessage) => {
        expect(chatMessage.date).toBeDefined();
        expect(chatMessage.message).toBe('Hello from testing.');
        expect(chatMessage.nickname).toBe('mockNicknameChat');
      });
    });

    ws.on('error', err => {
      expect(err).toBeNull();
      ws.close();
      throw err;
    });
  });
});
