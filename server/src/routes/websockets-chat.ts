import * as WebSocket from 'ws';

import { Server } from 'ws';

import { API_ROOT_PATH, API_WS_ROOT_PATH } from '../config';
import { WebSocketsChat as WebSocketsChatController } from '../controllers';
import { AngularChatRequest } from '../shared';
import { WebSocketHeartbeat } from '../shared/typings';
import { Noop } from '../utils';

export class WebSocketsChat {
  public static setupWebSocketsChat(verifyClientFunction: any) {
    // /ws/chat route definitions.
    const webSocketServer: Server = new WebSocket.Server({
      noServer: true,
      path: API_ROOT_PATH + API_WS_ROOT_PATH + '/chat',
      verifyClient: verifyClientFunction,
    });

    this.setupEvents(webSocketServer);

    return webSocketServer;
  }

  private static setupEvents(webSocketServer: Server) {
    webSocketServer.on('connection', (ws: WebSocketHeartbeat, req: AngularChatRequest) => {
      const webSocketsChatController = new WebSocketsChatController(webSocketServer);
      ws.isAlive = true;

      webSocketsChatController.onOpen(ws, req);
      // ws.on('open', () => webSocketsChatController.onOpen(ws, req));
      ws.on('close', () => webSocketsChatController.onClose(ws, req));
      ws.on('error', (err: Error) => webSocketsChatController.onError(err));
      ws.on('message', (data: string) => webSocketsChatController.onMessage(ws, req, data));
      ws.on('pong', () => webSocketsChatController.onPong(ws, req));
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
