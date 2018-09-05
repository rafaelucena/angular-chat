import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgModelGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

import { HomeService } from '../../services/home.service';
import { AppService } from '../../../shared/services/app.service';
import { Status } from '../../../shared/enums/status';
import { User } from '../../../shared/models/user';
import { JoinChatroomResponse } from '../../models/join-chatroom-response';

@Component({
  selector: 'ac-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [HomeService],
})
export class HomeComponent implements OnInit, OnDestroy {
  public Status: typeof Status = Status;
  public joinChatStatus: Status;

  private subscription: Subscription;

  constructor(
    private router: Router,
    private homeService: HomeService,
    private appService: AppService,
    private snackBar: MatSnackBar,
  ) {}

  public ngOnInit(): void {
    this.joinChatStatus = Status.INITIAL;
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public joinRoom(nickname: NgModelGroup) {
    const user: User = new User(nickname.control.value);

    this.joinChatStatus = Status.PENDING;
    this.subscription = this.homeService.sendJoinRequest(user).subscribe(
      () => {
        // Notify the global service that the user joined the chatroom.
        this.appService.startChatting(true);
        this.snackBar.dismiss();
        this.moveToRoute(['/', 'chat']);
      },
      (response: JoinChatroomResponse) => {
        this.joinChatStatus = Status.ERROR;
        this.snackBar.open(response.error.message, null, {
          duration: 5000,
        });
      },
    );
  }

  public moveToRoute(route: string[]): void {
    this.router.navigate(route).catch(err => console.error(err));
  }
}
