"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalBroadcastIp = void 0;
var os = require("os");
function getLocalBroadcastIp() {
    var interfaces = os.networkInterfaces();
    return interfaces.en0.filter(function (addr) { return addr.family === 'IPv4' && addr.internal === false; })[0].address;
}
exports.getLocalBroadcastIp = getLocalBroadcastIp;
//# sourceMappingURL=getLocalBroadcastIp.js.map