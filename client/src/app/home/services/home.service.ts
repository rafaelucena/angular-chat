import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';

import { User } from '../../shared/models/user';
import { JoinChatroomResponse } from '../models/join-chatroom-response';
import { BACKEND_URL } from '../../shared/consts/consts';

@Injectable()
export class HomeService {
  private joinRoomUrl = `http://${BACKEND_URL}/join`;

  public constructor(private http: HttpClient) {}

  public sendJoinRequest(user: User): Observable<JoinChatroomResponse> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    return new Observable((subscriber: Subscriber<JoinChatroomResponse>) => {
      this.http
        .post<JoinChatroomResponse>(
          this.joinRoomUrl,
          {
            nickname: user.nickname,
          },
          { headers, withCredentials: true },
        )
        .subscribe(
          () => {
            subscriber.next(new JoinChatroomResponse());
            subscriber.complete();
          },
          (errorResponse: JoinChatroomResponse) => {
            const message = errorResponse.error.message
              ? errorResponse.error.message
              : 'Error connecting to the server, please try again.';
            subscriber.error(new JoinChatroomResponse({ message }));
          },
        );
    });
  }
}
