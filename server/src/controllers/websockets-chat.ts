import * as WebSocket from 'ws';

import { Server } from 'ws';
import { WebSocketMessageType } from '../enums';
import { ChatMessage, IFormattedChatMessage, IWebsocketMessage } from '../models';
import { Chat, UsersOnline } from '../services';
import { AngularChatRequest, Logger } from '../shared';
import { WebSocketHeartbeat } from '../shared/typings';
import { autoRetry } from '../utils';
import { WebSocketsUsersOnline } from './';

export class WebSocketsChat {
  private readonly logger = Logger.getInstance();

  public constructor(private readonly wss: Server) {}

  public async onOpen(ws: WebSocketHeartbeat, req: AngularChatRequest): Promise<void> {
    const nickname: string = req.session.nickname;

    // Adds a joining message to the db when a user connects.
    const date: string = new Date().toISOString();
    const chatMessage = new ChatMessage('Angular Chat', `${nickname} joined the room.`, date);

    await autoRetry(() => Chat.addMessage(chatMessage));
    this.logger.notice(`${chatMessage.message}`);

    await autoRetry(() => UsersOnline.addUserToOnlineList(nickname, date));
    this.logger.debug(`${nickname} added to users online list.`);
    WebSocketsUsersOnline.notifyListUpdate();

    // Broadcast to users the new connection (Not including itself).
    this.broadcastMessage(ws, WebSocketsChat.formatChatMessages([chatMessage]), false);

    // Receive latest 10 messages from the room.
    const chatMessages: ChatMessage[] = await autoRetry(() => Chat.getLatestMessages(10));
    this.broadcastMessage(ws, WebSocketsChat.formatChatMessages(chatMessages).reverse(), true);
  }

  public async onClose(ws: WebSocketHeartbeat, req: AngularChatRequest): Promise<void> {
    const nickname: string = req.session.nickname;

    const date: string = new Date().toISOString();
    const chatMessage = new ChatMessage('Angular Chat', `${nickname} left the room.`, date);

    await autoRetry(() => Chat.addMessage(chatMessage));
    this.logger.notice(`${chatMessage.message}`);

    await autoRetry(() => UsersOnline.removeUserFromOnlineList(nickname));
    this.logger.debug(`${nickname} removed from users online list.`);
    WebSocketsUsersOnline.notifyListUpdate();

    // Send broadcast to all users when the client leaves the room (Not including itself).
    this.broadcastMessage(ws, WebSocketsChat.formatChatMessages([chatMessage]), false);

    await ws.terminate();

    this.logger.debug(
      `Closed WebSocket connection with: ${req.connection.remoteAddress} (Nickname: ${nickname})`,
    );
  }

  public onError(err: Error): void {
    this.logger.error('onError (chat): ' + err);
  }

  public async onMessage(ws: WebSocketHeartbeat, req: AngularChatRequest, message: string): Promise<void> {
    const nickname: string = req.session.nickname;

    let parsedMessage: IWebsocketMessage;
    try {
      parsedMessage = JSON.parse(message);

      // Add received message to the database.
      const date: string = new Date().toISOString();

      // Type can be: Request for users online list, logout or undefined.
      if (parsedMessage.type) {
        if ((parsedMessage.type as WebSocketMessageType) === WebSocketMessageType.LOGOUT) {
          this.logger.debug(
            `Received logout request from: ${
              req.connection.remoteAddress
            } (Nickname: ${nickname}), deleting session.`,
          );
          // Remove user from online list.
          return UsersOnline.removeUserFromOnlineList(nickname).then(() => {
            // TODO: Remove cookie from client application.
            req.session.cookie.expires = new Date(0);

            // Delete the session.
            req.session.destroy();

            // Close the current WebSocket connection.
            ws.close();
          });
        }
      }

      const chatMessage = new ChatMessage(nickname, parsedMessage.message!, date);

      await autoRetry(() => Chat.addMessage(chatMessage));
      this.logger.info(`${chatMessage.nickname} - ${chatMessage.message}`);

      // Send broadcast to all users when a new message is created.
      this.broadcastMessage(ws, WebSocketsChat.formatChatMessages([chatMessage]), true);
    } catch (err) {
      this.logger.error(
        `Received invalid JSON from ${req.session.nickname} (${
          req.connection.remoteAddress
        }): "${message}". Closing WebSocket connection.`,
      );
      return ws.close();
    }
  }

  public onPong(ws: WebSocketHeartbeat, req: AngularChatRequest): void {
    ws.isAlive = true;
    this.logger.debug(
      `received onPong (chat) from: ${req.session.nickname} (${req.connection.remoteAddress})`,
    );
  }

  private broadcastMessage(
    ws: WebSocketHeartbeat,
    chatMessage: IFormattedChatMessage[],
    sendToSelf: boolean,
  ): void {
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        const errorHandler = (err: Error) => {
          if (err) {
            this.logger.error(`Failed sending message to client: ${err}`);
          }
        };

        // Should the message be sent to everyone, including the client?
        if (sendToSelf) {
          return client.send(JSON.stringify(chatMessage), errorHandler);
        } else {
          if (client !== ws) {
            return client.send(JSON.stringify(chatMessage), errorHandler);
          }
        }
      }
    });
  }

  private static formatChatMessages(chatMessages: ChatMessage[]): IFormattedChatMessage[] {
    return chatMessages.map((message: ChatMessage) => ({
      date: message.created_at!,
      message: message.message,
      nickname: message.nickname,
    }));
  }
}
