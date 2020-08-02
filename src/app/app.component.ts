import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { ChromecastService } from './shared/services/chromecast/chromecast.service';
import { ApiService } from './shared/services/api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private chromecastService: ChromecastService,
    private apiService: ApiService
  ) {
    this.chromecastService.listenForDevices();

    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  async ngOnInit() {
    await this.apiService.updateUserDataPath();
  }

  ngOnDestroy() {
    this.chromecastService.stopPlayingSelectedDevice();
  }
}
