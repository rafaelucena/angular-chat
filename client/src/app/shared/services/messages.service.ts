import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Message } from '../../chat/models/message';
import { BACKEND_URL } from '../consts/consts';
import { ApiMessaging } from '../models/api-messaging';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private wsEndpoint = `ws://${BACKEND_URL}/ws/chat`;
  private ws: WebSocket;

  public clearMessages(): void {
    this.ws.close();
    this.messages$.complete();
    this.messages$ = new BehaviorSubject<Message[]>([]);
  }

  public getMessages(): Observable<Message[]> {
    return new Observable(subscriber => {
      this.ws = new WebSocket(this.wsEndpoint);

      // The server will send the last 10 messages as a Messages[]
      this.ws.onmessage = (response: any) => {
        const parsedResponse: any[] = JSON.parse(response.data);
        const messages = parsedResponse.map(
          (message: Message) => new Message(message.nickname, message.message, message.date),
        );

        subscriber.next(messages);
      };

      this.ws.onclose = (response: any) => {
        if (response.code === 1006) {
          return subscriber.error(
            new ApiMessaging('Error connecting to the server, please try again later.'),
          );
        }
        return subscriber.error(new ApiMessaging(response.reason));
      };
    });
  }

  public sendMessage(message: string): void {
    // The message is formatted as the value that the server responds to
    // { message: `${value}` }
    this.ws.send(JSON.stringify(new ApiMessaging(message)));
  }
}
