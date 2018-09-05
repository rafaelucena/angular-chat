import { RequestHandler, Response } from 'express';
import { Server as HttpServer } from 'http';
import { parse } from 'url';

import { API_ROOT_PATH, API_WS_ROOT_PATH } from '../config';
import { AngularChatRequest, Logger } from '../shared';
import { WebSocketsChat, WebSocketsUsersOnline } from './';

export class WebSockets {
  public static setupWebSocketsServer(httpServer: HttpServer, session: RequestHandler) {
    // Application-wide websockets routes definitions.

    const verifyClientFunction = (info: any, done: any): void => {
      session(info.req as AngularChatRequest, {} as Response, () => {
        const sessionCookie: string | string[] | undefined = info.req.headers.cookie;

        const message = 'Invalid data received, please clear your offline storage/cookies and try again.';
        if (!sessionCookie) {
          this.logger.error(
            `Invalid cookie received from ${
              info.req.connection.remoteAddress
            }, closing WebSocket connection.`,
          );
          return done(false, 1000, message);
        }

        if (!(info.req as AngularChatRequest).session.nickname) {
          this.logger.error(
            `Invalid session data from ${info.req.connection.remoteAddress} (Cookies: ${JSON.stringify(
              sessionCookie,
            )}), closing WebSocket connection.`,
          );
          return done(false, 1000, message);
        }

        this.logger.debug(
          `Established WebSocket connection to ${info.req.url} with: ${
            info.req.connection.remoteAddress
          } (Nickname: ${(info.req as AngularChatRequest).session.nickname})`,
        );
        return done(true);
      });
    };

    const webSocketsChat = WebSocketsChat.setupWebSocketsChat(verifyClientFunction);
    const webSocketsUsersOnline = WebSocketsUsersOnline.setupWebSocketsUsersOnline(verifyClientFunction);

    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = parse(request.url).pathname;

      switch (pathname) {
        case API_ROOT_PATH + API_WS_ROOT_PATH + '/chat':
          webSocketsChat.handleUpgrade(request, socket, head, ws => {
            webSocketsChat.emit('connection', ws, request);
          });
          break;
        case API_ROOT_PATH + API_WS_ROOT_PATH + '/users-online':
          webSocketsUsersOnline.handleUpgrade(request, socket, head, ws => {
            webSocketsUsersOnline.emit('connection', ws, request);
          });
          break;
        default:
          socket.destroy();
      }
    });
  }

  private static logger = Logger.getInstance();

  private constructor() {}
}
