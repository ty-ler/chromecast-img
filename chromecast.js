const ChromecastAPI = require("chromecast-api");

const client = new ChromecastAPI();

client.update();

console.log(client.devices);

client.on("device", function (device) {
  var mediaURL =
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4";

  console.log(device);

  // device.play(mediaURL, function (err) {
  //   if (!err) console.log("Playing in your chromecast");
  // });
});
