import * as WebSocket from 'ws';

import { ClientRequest, IncomingMessage } from 'http';
import { Server } from 'ws';

import { API_ROOT_PATH, API_WS_ROOT_PATH } from '../config';
import { WebSocketsUsersOnline as WebSocketsUsersOnlineController } from '../controllers';
import { AngularChatRequest } from '../shared';
import { WebSocketHeartbeat } from '../shared/typings';
import { Noop } from '../utils';

export class WebSocketsUsersOnline {
  public static setupWebSocketsUsersOnline(verifyClientFunction: any) {
    // /ws/users-online route definitions.
    const webSocketServer: Server = new WebSocket.Server({
      noServer: true,
      path: API_ROOT_PATH + API_WS_ROOT_PATH + '/users-online',
      verifyClient: verifyClientFunction,
    });

    this.setupEvents(webSocketServer);

    return webSocketServer;
  }

  private static setupEvents(webSocketServer: Server) {
    webSocketServer.on('connection', (ws: WebSocketHeartbeat, req: AngularChatRequest) => {
      ws.isAlive = true;
      WebSocketsUsersOnlineController.wss = webSocketServer;

      WebSocketsUsersOnlineController.onOpen(ws, req);
      ws.on('close', () => WebSocketsUsersOnlineController.onClose(ws, req));
      ws.on('error', (err: Error) => WebSocketsUsersOnlineController.onError(err));
      ws.on('ping', () => WebSocketsUsersOnlineController.onPing(ws, req));
      ws.on('pong', () => WebSocketsUsersOnlineController.onPong(ws, req));
      ws.on('unexpected-response', (clientReq: ClientRequest, clientRes: IncomingMessage) =>
        WebSocketsUsersOnlineController.onUnexpectedResponse(ws, clientReq, clientRes),
      );
    });

    setInterval(() => {
      webSocketServer.clients.forEach((ws: any) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(Noop);
      });
    }, 30 * 1000);
  }

  private constructor() {}
}
