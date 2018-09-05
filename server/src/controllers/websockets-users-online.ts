import * as WebSocket from 'ws';

import { ClientRequest, IncomingMessage } from 'http';

import { Server } from 'ws';
import { UsersOnline } from '../models';
import { UsersOnline as UsersOnlineService } from '../services';
import { AngularChatRequest, Logger } from '../shared';
import { WebSocketHeartbeat } from '../shared/typings';
import { autoRetry } from '../utils';

export class WebSocketsUsersOnline {
  private static logger = Logger.getInstance();
  public static wss: Server;

  public static async onOpen(ws: WebSocket, req: AngularChatRequest): Promise<void> {
    const nickname: string = req.session.nickname;

    // Adds a joining message to the db when the user connects.
    const date: string = new Date().toISOString();

    const usersOnline: UsersOnline[] = await autoRetry(() => UsersOnlineService.getUsersOnline());
    this.logger.debug(`${nickname} requested the users online list.`);

    ws.send(JSON.stringify(this.formatUsersOnline(usersOnline)));
  }

  public static onClose(ws: WebSocket, req: AngularChatRequest): void {
    this.logger.debug(`${req.session.nickname} disconnected from the users online list.`);
    ws.terminate();
  }

  public static onError(err: Error): void {
    this.logger.error('onError (users-online): ' + err);
  }

  public static onPing(ws: WebSocketHeartbeat, req: AngularChatRequest): void {
    this.logger.debug(
      `received onPing (users-online) from: ${req.session.nickname} (${req.connection.remoteAddress})`,
    );
  }

  public static onPong(ws: WebSocketHeartbeat, req: AngularChatRequest): void {
    ws.isAlive = true;
    this.logger.debug(
      `received onPong (users-online) from: ${req.session.nickname} (${req.connection.remoteAddress})`,
    );
  }

  public static onUnexpectedResponse(
    ws: WebSocket,
    clientReq: ClientRequest,
    clientRes: IncomingMessage,
  ): void {
    this.logger.error('onUnexpectedResponse: ' + clientReq + ' - ' + clientRes);
  }

  public static async notifyListUpdate(): Promise<void> {
    // If there are no client connections, just ignore the request.
    if (!this.wss) {
      return;
    }

    const usersOnline: UsersOnline[] = await autoRetry(() => UsersOnlineService.getUsersOnline());

    const formattedUsersOnline = WebSocketsUsersOnline.formatUsersOnline(usersOnline);
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        // Message will be sent to everyone.
        client.send(JSON.stringify(formattedUsersOnline));
      }
    });
  }

  public static formatUsersOnline(usersOnline: UsersOnline[]): Array<{ nickname: string }> {
    return usersOnline
      .map((userOnline: UsersOnline) => ({
        nickname: userOnline.nickname,
      }))
      .sort((a, b) => {
        const aNameLower = a.nickname.toLowerCase();
        const bNameLower = b.nickname.toLowerCase();

        if (aNameLower < bNameLower) {
          return -1;
        }

        if (aNameLower > bNameLower) {
          return 1;
        }

        return 0;
      });
  }
}
