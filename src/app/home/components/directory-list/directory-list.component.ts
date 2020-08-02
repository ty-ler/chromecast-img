import {
  Component,
  OnInit,
  Pipe,
  PipeTransform,
  OnDestroy,
} from '@angular/core';
import { ElectronService } from 'app/core/services';
import { ApiService } from 'app/shared/services/api/api.service';
import { Image } from 'models/api';
import { SubscriptionFactory } from 'app/utils/SubscriptionFactory';
import { Device } from 'models/device';
import { ChromecastService } from 'app/shared/services/chromecast/chromecast.service';

@Pipe({
  pure: true,
  name: 'imageToBase64Image',
})
export class ImageToBase64ImagePipe implements PipeTransform {
  transform(image: Image) {
    return `data:${image.contentType};base64,${image.thumbnail}`;
  }
}

@Component({
  selector: 'app-directory-list',
  templateUrl: './directory-list.component.html',
  styleUrls: ['./directory-list.component.scss'],
})
export class DirectoryListComponent implements OnInit, OnDestroy {
  public directorySelected: boolean = false;
  public loadingDirectory: boolean = false;
  public selectedDirectoryPath: string = null;

  public images: Image[] = null;
  public selectedImages: Image[] = [];

  public allImagesSelected: boolean = false;

  public selectedDevice: Device = null;

  public attemptingSlideshowPlay: boolean = false;
  public slideshowPlaying: boolean = false;
  public slideshowImage: Image = null;

  private sf = new SubscriptionFactory();

  constructor(
    private electronService: ElectronService,
    private apiService: ApiService,
    private chromecastService: ChromecastService
  ) {}

  ngOnInit(): void {
    this.sf.subscribe(
      this.chromecastService.selectedDevice,
      (device: Device) => {
        this.selectedDevice = device;
      }
    );

    this.sf.subscribe(
      this.chromecastService.slideshowPlaying,
      (slideshowPlaying: boolean) => {
        this.slideshowPlaying = slideshowPlaying;

        if (
          this.slideshowPlaying === true &&
          this.attemptingSlideshowPlay === true
        ) {
          this.attemptingSlideshowPlay = false;
        }
      }
    );

    this.sf.subscribe(
      this.chromecastService.slideshowImage,
      (slideshowImage: Image) => (this.slideshowImage = slideshowImage)
    );
  }

  ngOnDestroy() {
    this.sf.stopListening();
  }

  public onPlayStopClick() {
    if (this.slideshowPlaying === false) {
      this.startSlideshow();
    } else {
      this.stopSlideshow();
    }
  }

  public onSelectAllImages() {
    this.selectAllImages();
  }

  public onClearSelectedImages() {
    this.clearSelectedImages();
  }

  public onSelectImage(image: Image) {
    if (
      this.attemptingSlideshowPlay === true ||
      this.slideshowPlaying === true
    ) {
      return;
    }

    this.selectImage(image);
  }

  public play(image: Image) {
    if (this.selectedDevice === null) {
    }

    this.selectedDevice.play(image.url, (error) => {
      if (error) {
        console.log(error);
      }
      console.log('playing', image.url);
    });
  }

  public async onOpenDirectoryButtonClick(recursive: boolean = true) {
    await this.openDirectoryDialog(recursive);
  }

  private startSlideshow() {
    this.attemptingSlideshowPlay = true;
    this.chromecastService.startSlideshowWithImages(this.selectedImages, 1000);
  }

  private stopSlideshow() {
    this.chromecastService.stopSlideshow();
  }

  private selectImage(image: Image) {
    image.selected = image.selected != null ? !image.selected : true;

    this.selectedImages = this.images.filter(
      (image) => image.selected === true
    );

    this.allImagesSelected = this.selectedImages.length === this.images.length;
  }

  private selectAllImages() {
    this.selectedImages = this.images.map((image) => {
      if (!image.selected) {
        this.selectImage(image);
      }

      return image;
    });
  }

  private clearSelectedImages() {
    this.images.map((image) => {
      if (image.selected === true) {
        this.selectImage(image);
      }
    });

    this.selectedImages = [];
  }

  private async openDirectoryDialog(recursive: boolean) {
    const result = await this.electronService.remote.dialog.showOpenDialog({
      title: 'Open Photos Directory',
      properties: ['openDirectory'],
    });

    if (result.canceled === false) {
      const directoryPath = result.filePaths[0];

      await this.openDirectory(directoryPath, recursive);
    }
  }

  private async openDirectory(directoryPath: string, recursive: boolean) {
    this.selectedDirectoryPath = directoryPath;

    this.chromecastService.stopPlayingSelectedDevice();
    this.directorySelected = true;
    this.loadingDirectory = true;

    const dirResponse = await this.apiService.openDirectory(
      directoryPath,
      recursive
    );

    this.loadingDirectory = false;

    this.images = [];
    this.clearSelectedImages();

    this.images = dirResponse.images;

    console.log(this.images);
  }
}
