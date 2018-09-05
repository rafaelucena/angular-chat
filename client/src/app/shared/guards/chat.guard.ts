import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../services/app.service';

@Injectable({
  providedIn: 'root',
})
export class ChatGuard implements CanActivate {
  constructor(private appService: AppService, private router: Router) {}

  public canActivate(): boolean {
    // User hasn't started a chat session.
    if (!this.appService.isInSession()) {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
