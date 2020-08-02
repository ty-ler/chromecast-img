import * as process from 'process';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as _path from 'path';
import * as bodyParser from 'body-parser';
import * as glob from 'fast-glob';
import * as imageThumbnail from 'image-thumbnail';
import * as mimeTypes from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { Image, DirectoryResponse } from './models/api';
import { getLocalBroadcastIp } from './utils/getLocalBroadcastIp';
import { PORT } from './globals';

const sanitize = require('sanitize-filename');

let localBroadcastIp: string = getLocalBroadcastIp();

let _userDataPath: string = null;
let _staticImagesPath: string = null;

const cors = require('cors');
const app = express();

export default function createServer() {
  onExit();

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.put('/userDataPath', (req, res) => {
    const userDataPath = req.body.userDataPath;

    setUserDataPath(userDataPath);

    res.status(200);
    res.end();
  });

  app.put('/open', async (req, res) => {
    const path = req.body.path;
    const recursive = req.body.recursive;

    const images = await hostDirectory(path, recursive);

    const result: DirectoryResponse = {
      path,
      images,
    };

    res.status(200);
    res.json(result);
  });

  app.listen(PORT, localBroadcastIp, () =>
    console.log(`Listening at http://${localBroadcastIp}:${PORT}`)
  );

  /**
   * Functions
   */

  async function hostDirectory(path: string, recursive: boolean = true) {
    console.log(recursive);

    const filesPaths = await findImagesInPath(path, recursive);

    const images = await copyImagesToStaticIamgesPath(filesPaths);

    return images;
  }

  async function findImagesInPath(path: string, recursive: boolean) {
    const images: Image[] = [];

    let searchPathPattern;

    if (recursive === true) {
      searchPathPattern = `${path}/**/*.+(png|jpg|jpeg|png)`;
    } else {
      searchPathPattern = `${path}/*.+(png|jpg|jpeg|png)`;
    }

    return await glob(searchPathPattern);
  }

  async function copyImagesToStaticIamgesPath(filePaths: string[]) {
    console.log('Clearing static images path...');

    fs.emptyDirSync(_staticImagesPath);

    console.log('Copying images found to static images path...');

    let images = await Promise.all(
      filePaths.map(async (filePath) => {
        const fileName = _path.basename(filePath);
        const staticImageFilePath: string = `${_staticImagesPath}/${fileName}`;

        fs.copyFileSync(filePath, staticImageFilePath);

        // Read-write all
        fs.chmodSync(staticImageFilePath, '666');

        const image = await getImageResult(fileName, staticImageFilePath);

        return image;
      })
    );

    // Filter out failed images...
    images = images.filter((image) => image != null);

    return images;
  }

  function cleanFileName(fileName: string) {}

  async function getImageResult(fileName: string, staticImageFilePath: string) {
    const fileExtension: string = _path.extname(fileName).split('.')[1];

    const contentType: string = mimeTypes.contentType(`.${fileExtension}`);

    const thumbnailSize = 70;

    const thumbnailOptions = {
      width: thumbnailSize,
      height: thumbnailSize,
      responseType: 'base64',
    };

    const url = encodeURI(
      `http://${localBroadcastIp}:${PORT}/images/${fileName}`
    );

    const id = uuidv4();

    try {
      const thumbnail = await imageThumbnail(
        staticImageFilePath,
        thumbnailOptions
      );

      const image: Image = {
        id,
        fileName,
        fileExtension,
        contentType,
        url,
        thumbnail,
      };

      return image;
    } catch (e) {
      console.warn(
        `Failed to create thumbnail for file: ${staticImageFilePath}!`
      );
    }
  }

  function setUserDataPath(userDataPath: string) {
    if (_userDataPath !== null) {
      return;
    }

    console.log(`Setting user data path: ${userDataPath}`);

    _userDataPath = userDataPath;

    checkUserDataPathForImagesPath();
  }

  function checkUserDataPathForImagesPath() {
    if (_userDataPath === null) {
      console.warn('userDataPath is null');
      return;
    }

    _staticImagesPath = _path.join(_userDataPath, 'images');

    const staticImagesPathExists = fs.existsSync(_staticImagesPath);

    if (staticImagesPathExists === false) {
      createStaticImagesPath();
    } else {
      hostStaticImagesPath();
    }
  }

  function createStaticImagesPath() {
    if (_staticImagesPath === null) {
      console.warn('_staticImagesPath is null');
      return;
    }

    console.log('Initializing static images path...');

    fs.mkdirSync(_staticImagesPath);

    console.log(`${_staticImagesPath} created!`);

    hostStaticImagesPath();
  }

  function hostStaticImagesPath() {
    app.use('/images', express.static(_staticImagesPath));
  }
}

// createServer();

function exitHandler() {
  process.exit();
}

function cleanUpStaticImagesPath() {
  let staticImagesPathExists = fs.existsSync(_staticImagesPath);

  if (staticImagesPathExists === true) {
    fs.removeSync(_staticImagesPath);

    staticImagesPathExists = fs.existsSync(_staticImagesPath);

    if (staticImagesPathExists === false) {
      console.log('Cleaned up static images directory...');
    } else {
      console.warn('Failed to clean up static images directory.');
    }
  }
}

function onExit() {
  //do something when app is closing
  process.on('exit', cleanUpStaticImagesPath);

  //catches ctrl+c event
  process.on('SIGINT', exitHandler);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  //catches uncaught exceptions
  // process.on('uncaughtException', exitHandler));
}
