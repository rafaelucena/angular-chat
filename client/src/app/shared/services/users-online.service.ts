import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Message } from '../../chat/models/message';
import { BACKEND_URL } from '../consts/consts';
import { ApiMessaging } from '../models/api-messaging';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UsersOnlineService {
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private wsEndpoint = `ws://${BACKEND_URL}/ws/users-online`;
  private ws: WebSocket;

  public clearMessages(): void {
    this.ws.close();
    this.messages$.complete();
    this.messages$ = new BehaviorSubject<Message[]>([]);
  }

  public getOnlineUsers(): Observable<User[]> {
    return new Observable(subscriber => {
      this.ws = new WebSocket(this.wsEndpoint);

      // The server will send the last 10 messages as a Messages[]
      this.ws.onmessage = (response: any) => {
        const parsedResponse: any[] = JSON.parse(response.data);
        const users = parsedResponse.map((user: User) => new User(user.nickname));

        subscriber.next(users);
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
}
