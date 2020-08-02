import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../shared/shared.module';
import { DeviceListComponent } from './components/device-list/device-list.component';
import {
  DirectoryListComponent,
  ImageToBase64ImagePipe,
} from './components/directory-list/directory-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    DeviceListComponent,
    DirectoryListComponent,
    ImageToBase64ImagePipe,
  ],
  imports: [CommonModule, SharedModule, HomeRoutingModule],
})
export class HomeModule {}
