import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectoryResponse } from 'models/api';
import { ElectronService } from 'app/core/services';
import { getLocalBroadcastIp } from 'utils/getLocalBroadcastIp';
import { PORT } from 'globals';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public localBroadcastIp: string = getLocalBroadcastIp();
  public API_URL_BASE: string;

  constructor(
    private http: HttpClient,
    private electronService: ElectronService
  ) {
    this.API_URL_BASE = `http://${this.localBroadcastIp}:${PORT}`;
  }

  public async openDirectory(path: string, recursive: boolean = true) {
    const endpoint = `${this.API_URL_BASE}/open`;

    const res = await this.http
      .put<DirectoryResponse>(endpoint, {
        path,
        recursive,
      })
      .toPromise();

    return res;
  }

  public async updateUserDataPath() {
    console.log('updating user data path');

    // Get user data path
    const userDataPath: string = this.electronService.remote.app.getPath(
      'userData'
    );

    const endpoint = `${this.API_URL_BASE}/userDataPath`;

    // Send user data path to API
    const res = await this.http
      .put<any>(endpoint, {
        userDataPath,
      })
      .toPromise();
  }
}
