import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../services/app.service';

@Injectable({
  providedIn: 'root',
})
export class HomeGuard implements CanActivate {
  constructor(private appService: AppService, private router: Router) {}

  public canActivate(): boolean {
    // User hasn't started a chat session.
    if (!this.appService.isInSession()) {
      return true;
    }

    // User started a session, move to chat.
    this.router.navigate(['/chat']);
    return false;
  }
}
