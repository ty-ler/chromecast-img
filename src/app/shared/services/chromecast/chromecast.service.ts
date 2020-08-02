import { Injectable, NgZone } from '@angular/core';
import { Client } from 'models/client';
import { Device } from 'models/device';
import { Image } from 'models/api';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-es';

const ChromecastAPI = (<any>window).require('chromecast-api');

@Injectable({
  providedIn: 'root',
})
export class ChromecastService {
  public client: Client = new ChromecastAPI();

  public devices = new BehaviorSubject<Device[]>([]);
  public selectedDevice = new BehaviorSubject<Device>(null);

  public slideshowPlaying = new BehaviorSubject<boolean>(false);
  public slideshowStopped: boolean = true;
  public slideshowInterval: any = null;
  public slideshowIntervalTime: number = null;
  public slideshowImages: Image[] = null;
  public slideshowImageIndex: number = null;
  public slideshowImage = new BehaviorSubject<Image>(null);
  public attemptingSlideshowStreamImage: boolean = false;

  public listeningForDevices: boolean = false;

  constructor(private ngZone: NgZone) {}

  public listenForDevices() {
    if (this.listeningForDevices === true) {
      return;
    }

    this.listeningForDevices = true;

    this.client.on('device', (device) => this.buildDeviceList());
  }

  public startSlideshowWithImages(
    images: Image[],
    slideshowIntervalTime: number
  ) {
    this.slideshowStopped = false;

    if (this.slideshowImageIndex === null) {
      this.slideshowImageIndex = 0;
    }

    this.slideshowImages = cloneDeep(images);
    this.slideshowIntervalTime = slideshowIntervalTime;

    this.setupSlideshowInterval();
  }

  public stopSlideshow() {
    this.slideshowStopped = true;
    this.slideshowImages = null;
    this.slideshowImageIndex = null;
    this.slideshowImage.next(null);
    this.attemptingSlideshowStreamImage = false;

    this.clearSlideshowInterval();

    this.slideshowPlaying.next(false);
  }

  private setupSlideshowInterval() {
    const selectedDevice = this.selectedDevice.value;

    this.onSlideshowInterval(selectedDevice);

    this.slideshowInterval = setInterval(() => {
      this.onSlideshowInterval(selectedDevice);
    }, this.slideshowIntervalTime);
  }

  private onSlideshowInterval(selectedDevice: Device) {
    if (
      this.attemptingSlideshowStreamImage === true ||
      this.slideshowStopped === true
    ) {
      return;
    }

    const slideshowImage: Image = this.slideshowImages[
      this.slideshowImageIndex
    ];

    this.attemptingSlideshowStreamImage = true;

    console.time('time to play');

    selectedDevice.play(slideshowImage.url, () => {
      this.ngZone.run(() => {
        this.onSlideshowImagePlayed(slideshowImage);
      });
    });
  }

  private onSlideshowImagePlayed(slideshowImage: Image) {
    if (
      this.slideshowPlaying.value === false &&
      this.slideshowStopped === false
    ) {
      console.log('Starting slideshow...');
      this.slideshowPlaying.next(true);
    }

    if (this.slideshowStopped === false) {
      console.timeEnd('time to play');
      this.slideshowImage.next(slideshowImage);
      console.log(`Playing ${slideshowImage.url}!`);
      this.attemptingSlideshowStreamImage = false;

      this.slideshowImageIndex++;
      if (this.slideshowImageIndex === this.slideshowImages?.length) {
        this.slideshowImageIndex = 0;
      }
    }
  }

  private clearSlideshowInterval() {
    if (this.slideshowInterval === null) {
      return;
    }

    clearTimeout(this.slideshowInterval);

    this.slideshowInterval = null;
    this.slideshowIntervalTime = null;
  }

  public stopPlayingSelectedDevice() {
    if (this.selectedDevice.value === null) {
      return;
    }

    const selectedDevice = this.selectedDevice.value;
    selectedDevice.close(() => {
      console.log(selectedDevice.friendlyName);
    });
  }

  public getDevices() {
    return this.devices.value;
  }

  public selectDevice(device: Device) {
    this.selectedDevice.next(device);
  }

  private buildDeviceList() {
    this.ngZone.run(() => {
      this.devices.next(this.client.devices);
    });
  }
}
