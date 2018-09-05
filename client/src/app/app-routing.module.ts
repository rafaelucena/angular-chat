import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatGuard } from './shared/guards/chat.guard';
import { HomeGuard } from './shared/guards/home.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './home/home.module#HomeModule',
    canActivate: [HomeGuard],
  },
  {
    path: 'about',
    loadChildren: './about/about.module#AboutModule',
  },
  {
    path: 'chat',
    loadChildren: './chat/chat.module#ChatModule',
    canActivate: [ChatGuard],
  },
  {
    path: '**',
    loadChildren: './not-found/not-found.module#NotFoundModule',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
