import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { ChromecastService } from './services/chromecast/chromecast.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material.module';
import { ApiService } from './services/api/api.service';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    BrowserAnimationsModule,
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
})
export class SharedModule {}
