import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NotFoundRoutingModule } from './chat-routing.module';
import { MaterialModule } from '../shared/modules/material.module';

import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  imports: [CommonModule, NotFoundRoutingModule, MaterialModule, FormsModule],
  declarations: [ChatComponent],
})
export class ChatModule {}
