export interface Device {
  name: string; // Device name
  friendlyName: string; // Friendly device name
  host: string; // IP address
  changeSubtitles(subId: string, callback: () => void): void;
  changeSubtitlesSize(fontScale: number, callback: () => void): void;
  close(callback: () => void): void;
  getStatus(callback: () => void): void;
  pause(callback: () => void): void;
  play(resource: any, opts: any | (() => void), callback?: () => void): void;
  resume(callback: () => void): void;
  seek(seconds: number, callback: () => void): void;
  seekTo(newCurrentTime: number, callback: () => void): void;
  setVolume(volume: number, callback: () => void): void;
  setVolumeMuted(muted: boolean, callback: () => void): void;
  stop(callback: () => void): void;
  subtitlesOff(callback: () => void): void;
}
