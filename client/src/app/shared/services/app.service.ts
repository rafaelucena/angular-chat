import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Session } from '../models/session';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public session$: BehaviorSubject<Session | null> = new BehaviorSubject<Session | null>(
    this.getInitialSessionState(),
  );
  private static localStorageSessionIdentifier = 'isChatting';

  public startChatting(value: boolean): void {
    const session = new Session(value);
    this.addToLocalStorage(session);
    this.session$.next(session);
  }

  public isInSession(): boolean {
    // Validates if the user has started a chat session.
    return !!this.session$.getValue();
  }

  public clearSession(): void {
    localStorage.removeItem(AppService.localStorageSessionIdentifier);
    this.session$.complete();
    this.session$ = new BehaviorSubject<Session | null>(null);
  }

  private getInitialSessionState(): null | Session {
    let sessionIdentifier: Session | null = null;

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        if (key === AppService.localStorageSessionIdentifier) {
          sessionIdentifier = new Session(Boolean(localStorage[key]));
        }
      }
    }

    return sessionIdentifier ? sessionIdentifier : null;
  }

  private addToLocalStorage(session: Session): void {
    localStorage.setItem(AppService.localStorageSessionIdentifier, session.isChatting.toString());
  }
}
