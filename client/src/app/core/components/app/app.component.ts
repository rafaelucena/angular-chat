import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppService } from '../../../shared/services/app.service';
import { Status } from '../../../shared/enums/status';
import { User } from '../../../shared/models/user';
import { Session } from '../../../shared/models/session';
import { UsersListResponse } from '../../models/users-list-response';
import { MessagesService } from '../../../shared/services/messages.service';
import { UsersOnlineService } from '../../../shared/services/users-online.service';

@Component({
  selector: 'ac-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public isSidenavOpen: boolean;
  public isChatting: boolean;

  public Status: typeof Status = Status;
  public usersList: User[];
  public usersListRequestStatus: Status;
  public usersListErrorMessage: string;

  private sessionSubscription: Subscription;
  private usersListSubscription: Subscription;

  constructor(
    private router: Router,
    private appService: AppService,
    private usersOnlineService: UsersOnlineService,
    private messagesService: MessagesService,
  ) {}

  public ngOnInit(): void {
    this.isSidenavOpen = false;
    this.usersListRequestStatus = Status.INITIAL;
    this.initializeSession();
  }

  public ngOnDestroy(): void {
    // The following statements won't get called as this component is never removed from the screen.
    // I'm leaving them just for best practices purpose.
    this.sessionSubscription.unsubscribe();
    this.usersListSubscription.unsubscribe();
  }
  public initializeSession(): void {
    // The session observable gets called whenever the user joins the chat or logs out of the application.
    this.sessionSubscription = this.appService.session$.subscribe(
      (session: Session | null) => {
        // The session is empty when the component gets initialized.
        this.isChatting = session ? session.isChatting : false;
      },
      err => console.error(err),
      () => {
        this.isChatting = false;
      },
    );
  }

  public logout(): void {
    // Reset the current credentials
    this.appService.clearSession();
    this.sessionSubscription.unsubscribe();
    this.usersListSubscription.unsubscribe();
    this.messagesService.clearMessages();
    this.usersOnlineService.clearMessages();

    // Recreate session
    this.initializeSession();

    this.moveToRoute(['/']);
  }

  public moveToRoute(route: string[]): void {
    if (this.isSidenavOpen) {
      this.toggleSidenav();
    }

    this.router.navigate(route).catch(err => console.error(err));
  }

  public toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;

    // When chatting, call the backend for retrieving the online users list after the sidenav is opened.
    if (this.isChatting && this.isSidenavOpen) {
      this.requestUsersList();
    }
  }

  private requestUsersList(): void {
    // Only check for requests once, validating by the existence of a usersList subscription.
    if (!this.usersListSubscription || this.usersListSubscription.closed) {
      this.usersListRequestStatus = Status.PENDING;

      this.usersListSubscription = this.usersOnlineService.getOnlineUsers().subscribe(
        (usersOnline: User[]) => {
          this.usersListRequestStatus = Status.SUCCESS;
          this.usersList = usersOnline;
        },
        (errorResponse: UsersListResponse) => {
          this.usersListRequestStatus = Status.ERROR;
          this.usersListErrorMessage = errorResponse.message;
        },
      );
    }
  }
}
