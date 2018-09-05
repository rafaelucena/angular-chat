import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeRoutingModule } from './home-routing.module';
import { MaterialModule } from '../shared/modules/material.module';

import { HomeComponent } from './components/home/home.component';
import { CardComponent } from './components/card/card.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule, HomeRoutingModule, MaterialModule],
  declarations: [HomeComponent, CardComponent],
})
export class HomeModule {}
