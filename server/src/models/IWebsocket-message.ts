import { WebSocketMessageType } from '../enums';

export interface IWebsocketMessage {
  readonly message?: string;
  readonly type?: WebSocketMessageType;
}
