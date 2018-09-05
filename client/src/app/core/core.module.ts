import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../shared/modules/material.module';

import { AppComponent } from './components/app/app.component';

import { NavItemComponent } from './components/nav-item/nav-item.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule],
  declarations: [AppComponent, NavItemComponent, ToolbarComponent, SidenavComponent],
})
export class CoreModule {}
