import { Device } from './device';

export interface Client {
  devices: Device[];
  destroy(): void;
  queryMDNS(): void;
  querySSDP(): void;
  update(): void;
  on(event: string, callback: (device: Device) => void);
}
