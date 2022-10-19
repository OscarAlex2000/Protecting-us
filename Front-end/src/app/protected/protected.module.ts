import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapComponent } from './pages/map/map.component';
import { ProtectedRoutingModule } from './protected-routing.module';
import { SharedModule } from './shared/shared.module';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MapComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    ProtectedRoutingModule,
    SharedModule
  ]
})

export class ProtectedModule {}