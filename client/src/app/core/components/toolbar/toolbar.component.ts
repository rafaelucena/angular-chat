import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'ac-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  @Input()
  color = '';
  @Output()
  openMenu = new EventEmitter();
}
