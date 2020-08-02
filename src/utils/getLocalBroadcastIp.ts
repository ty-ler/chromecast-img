import * as os from 'os';

export function getLocalBroadcastIp() {
  const interfaces = os.networkInterfaces();

  return interfaces.en0.filter(
    (addr) => addr.family === 'IPv4' && addr.internal === false
  )[0].address;
}
