import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { MaterialModule } from '../shared/modules/material.module';

import { AboutComponent } from './components/about/about.component';

@NgModule({
  imports: [CommonModule, AboutRoutingModule, MaterialModule],
  declarations: [AboutComponent],
})
export class AboutModule {}
