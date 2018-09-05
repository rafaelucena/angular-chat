import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AppService } from '../../../shared/services/app.service';
import { Message } from '../../models/message';
import { Session } from '../../../shared/models/session';
import { Status } from '../../../shared/enums/status';
import { MessagesService } from '../../../shared/services/messages.service';
import { ApiMessaging } from '../../../shared/models/api-messaging';

@Component({
  selector: 'ac-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  public Status: typeof Status = Status;

  public messages: Message[];
  public messagesRequestStatus: Status;
  public messagesRequestErrorMessage: string;

  @ViewChild('chatComponent')
  private chatComponent: ElementRef;
  private session: Session;
  private appServiceSubscription: Subscription;
  private messagesServiceSubscription: Subscription;

  constructor(private appService: AppService, private messagesService: MessagesService) {}

  public ngOnInit(): void {
    this.messagesRequestStatus = Status.INITIAL;
    this.messages = [];

    this.appServiceSubscription = this.appService.session$.subscribe((session: Session) => {
      this.session = session;
    });

    this.requestInitialMessages();
    this.scrollToBottom();
  }

  public ngOnDestroy(): void {
    this.messagesServiceSubscription.unsubscribe();
    this.appServiceSubscription.unsubscribe();
    this.messages = null;
    this.messagesRequestStatus = null;
  }

  public requestInitialMessages(): void {
    if (this.messagesServiceSubscription) {
      this.messagesServiceSubscription.unsubscribe();
    }
    this.messagesServiceSubscription = this.messagesService.messages$.subscribe(
      (messages: Message[]) => {
        // Verify if it is the first time running, request messages.
        if (messages.length === 0) {
          this.messagesRequestStatus = Status.PENDING;
          this.messagesService.getMessages().subscribe(
            (messagesResponse: Message[]) => {
              // messages$ will be called again, but this time with data from the server.
              this.messagesService.messages$.next(
                this.messagesService.messages$.getValue().concat(messagesResponse),
              );
              this.messagesRequestStatus = Status.SUCCESS;
            },
            (error: ApiMessaging) => {
              this.messagesRequestErrorMessage = error.message;
              this.messagesRequestStatus = Status.ERROR;
              this.messagesService.clearMessages();
            },
          );
        } else {
          // And now with the given messages, initialize the current messages array as is.
          this.messages = messages;
          this.messagesRequestStatus = Status.SUCCESS;
        }
      },
    );
  }

  public ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  public sendMessage(form: NgForm): void {
    if (form.valid) {
      this.messagesService.sendMessage(form.value.message);

      // Reset form values.
      this.chatComponent.nativeElement.focus();
      form.resetForm();
    }
  }

  private scrollToBottom(): void {
    if (this.chatComponent) {
      this.chatComponent.nativeElement.scrollTop = this.chatComponent.nativeElement.scrollHeight;
    }
  }
}
