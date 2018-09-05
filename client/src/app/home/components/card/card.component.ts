import { Component, Input } from '@angular/core';

@Component({
  selector: 'ac-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input()
  public title = '';
}
