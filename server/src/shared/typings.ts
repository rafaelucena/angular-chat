import * as WebSocket from 'ws';

import { Request, RequestHandler } from 'express';

export type AngularChatRequest = Request & {
  session: AngularChatSession;
};

export type AngularChatSession = RequestHandler & {
  nickname: string;

  // Destroy is being set as any because there are no typing definitions for connect-session-knex module.
  destroy: any;
};

export type WebSocketHeartbeat = WebSocket & {
  isAlive: boolean;
};
