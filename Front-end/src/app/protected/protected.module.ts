import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapComponent } from './pages/map/map.component';
import { ProtectedRoutingModule } from './protected-routing.module';
import { SharedModule } from './shared/shared.module';
import { UsersComponent } from './pages/users/users.component';
import { UserComponent } from './pages/user/user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from './pages/loading/loading.component';
import { MapViewComponent } from './pages/map-view/map-view.component';

@NgModule({
  declarations: [
    DashboardComponent,
    MapComponent,
    MapViewComponent,
    UserComponent,
    UsersComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
    ProtectedRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})

export class ProtectedModule {}