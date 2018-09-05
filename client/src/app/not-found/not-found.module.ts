import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotFoundRoutingModule } from './not-found-routing.module';
import { MaterialModule } from '../shared/modules/material.module';

import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  imports: [CommonModule, NotFoundRoutingModule, MaterialModule],
  declarations: [NotFoundComponent],
})
export class NotFoundModule {}
