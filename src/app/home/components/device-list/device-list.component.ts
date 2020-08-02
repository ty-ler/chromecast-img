import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ChromecastService } from 'app/shared/services/chromecast/chromecast.service';
import { SubscriptionFactory } from 'app/utils/SubscriptionFactory';
import { Device } from 'models/device';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
export class DeviceListComponent implements OnInit, OnDestroy {
  public devices: Device[] = [];
  public selectedDevice: Device = null;
  public mediaIndex: number = 0;

  private sf = new SubscriptionFactory();

  constructor(private chromecastService: ChromecastService) {}

  ngOnInit(): void {
    this.sf.subscribe(this.chromecastService.devices, (devices: Device[]) =>
      this.initDeviceList(devices)
    );

    this.sf.subscribe(
      this.chromecastService.selectedDevice,
      (device: Device) => {
        this.selectedDevice = device;
      }
    );
  }

  ngOnDestroy() {
    this.sf.stopListening();
  }

  public selectDevice(device: Device) {
    if (device.name === this.selectedDevice?.name) {
      return;
    }

    this.chromecastService.selectDevice(device);

    localStorage.setItem('device', this.selectedDevice.name);
  }

  private initDeviceList(devices: Device[]) {
    if (this.selectedDevice === null) {
      this.getSelectedDeviceName();
    }

    this.devices = devices;
  }

  private getSelectedDeviceName() {
    const deviceName: string = localStorage.getItem('device');

    const selectedDevice: Device = this.chromecastService
      .getDevices()
      .filter((device) => device.name === deviceName)[0];

    if (selectedDevice) {
      this.chromecastService.selectDevice(selectedDevice);
    }
  }
}
