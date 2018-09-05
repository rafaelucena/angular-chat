import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ac-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  @Input()
  open = false;
  @Output()
  openSidenav = new EventEmitter();
  @Output()
  closeSidenav = new EventEmitter();
}
