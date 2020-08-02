"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var process = require("process");
var express = require("express");
var fs = require("fs-extra");
var _path = require("path");
var bodyParser = require("body-parser");
var glob = require("fast-glob");
var imageThumbnail = require("image-thumbnail");
var mimeTypes = require("mime-types");
var uuid_1 = require("uuid");
var getLocalBroadcastIp_1 = require("./utils/getLocalBroadcastIp");
var globals_1 = require("./globals");
var sanitize = require('sanitize-filename');
var localBroadcastIp = getLocalBroadcastIp_1.getLocalBroadcastIp();
var _userDataPath = null;
var _staticImagesPath = null;
var cors = require('cors');
var app = express();
function createServer() {
    var _this = this;
    onExit();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.put('/userDataPath', function (req, res) {
        var userDataPath = req.body.userDataPath;
        setUserDataPath(userDataPath);
        res.status(200);
        res.end();
    });
    app.put('/open', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var path, recursive, images, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = req.body.path;
                    recursive = req.body.recursive;
                    return [4 /*yield*/, hostDirectory(path, recursive)];
                case 1:
                    images = _a.sent();
                    result = {
                        path: path,
                        images: images,
                    };
                    res.status(200);
                    res.json(result);
                    return [2 /*return*/];
            }
        });
    }); });
    app.listen(globals_1.PORT, localBroadcastIp, function () {
        return console.log("Listening at http://" + localBroadcastIp + ":" + globals_1.PORT);
    });
    /**
     * Functions
     */
    function hostDirectory(path, recursive) {
        if (recursive === void 0) { recursive = true; }
        return __awaiter(this, void 0, void 0, function () {
            var filesPaths, images;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(recursive);
                        return [4 /*yield*/, findImagesInPath(path, recursive)];
                    case 1:
                        filesPaths = _a.sent();
                        return [4 /*yield*/, copyImagesToStaticIamgesPath(filesPaths)];
                    case 2:
                        images = _a.sent();
                        return [2 /*return*/, images];
                }
            });
        });
    }
    function findImagesInPath(path, recursive) {
        return __awaiter(this, void 0, void 0, function () {
            var images, searchPathPattern;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        images = [];
                        if (recursive === true) {
                            searchPathPattern = path + "/**/*.+(png|jpg|jpeg|png)";
                        }
                        else {
                            searchPathPattern = path + "/*.+(png|jpg|jpeg|png)";
                        }
                        return [4 /*yield*/, glob(searchPathPattern)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    function copyImagesToStaticIamgesPath(filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var images;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Clearing static images path...');
                        fs.emptyDirSync(_staticImagesPath);
                        console.log('Copying images found to static images path...');
                        return [4 /*yield*/, Promise.all(filePaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                                var fileName, staticImageFilePath, image;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            fileName = _path.basename(filePath);
                                            staticImageFilePath = _staticImagesPath + "/" + fileName;
                                            fs.copyFileSync(filePath, staticImageFilePath);
                                            // Read-write all
                                            fs.chmodSync(staticImageFilePath, '666');
                                            return [4 /*yield*/, getImageResult(fileName, staticImageFilePath)];
                                        case 1:
                                            image = _a.sent();
                                            return [2 /*return*/, image];
                                    }
                                });
                            }); }))];
                    case 1:
                        images = _a.sent();
                        // Filter out failed images...
                        images = images.filter(function (image) { return image != null; });
                        return [2 /*return*/, images];
                }
            });
        });
    }
    function cleanFileName(fileName) { }
    function getImageResult(fileName, staticImageFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileExtension, contentType, thumbnailSize, thumbnailOptions, url, id, thumbnail, image, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fileExtension = _path.extname(fileName).split('.')[1];
                        contentType = mimeTypes.contentType("." + fileExtension);
                        thumbnailSize = 70;
                        thumbnailOptions = {
                            width: thumbnailSize,
                            height: thumbnailSize,
                            responseType: 'base64',
                        };
                        url = encodeURI("http://" + localBroadcastIp + ":" + globals_1.PORT + "/images/" + fileName);
                        id = uuid_1.v4();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, imageThumbnail(staticImageFilePath, thumbnailOptions)];
                    case 2:
                        thumbnail = _a.sent();
                        image = {
                            id: id,
                            fileName: fileName,
                            fileExtension: fileExtension,
                            contentType: contentType,
                            url: url,
                            thumbnail: thumbnail,
                        };
                        return [2 /*return*/, image];
                    case 3:
                        e_1 = _a.sent();
                        console.warn("Failed to create thumbnail for file: " + staticImageFilePath + "!");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function setUserDataPath(userDataPath) {
        if (_userDataPath !== null) {
            return;
        }
        console.log("Setting user data path: " + userDataPath);
        _userDataPath = userDataPath;
        checkUserDataPathForImagesPath();
    }
    function checkUserDataPathForImagesPath() {
        if (_userDataPath === null) {
            console.warn('userDataPath is null');
            return;
        }
        _staticImagesPath = _path.join(_userDataPath, 'images');
        var staticImagesPathExists = fs.existsSync(_staticImagesPath);
        if (staticImagesPathExists === false) {
            createStaticImagesPath();
        }
        else {
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
        console.log(_staticImagesPath + " created!");
        hostStaticImagesPath();
    }
    function hostStaticImagesPath() {
        app.use('/images', express.static(_staticImagesPath));
    }
}
exports.default = createServer;
// createServer();
function exitHandler() {
    process.exit();
}
function cleanUpStaticImagesPath() {
    var staticImagesPathExists = fs.existsSync(_staticImagesPath);
    if (staticImagesPathExists === true) {
        fs.removeSync(_staticImagesPath);
        staticImagesPathExists = fs.existsSync(_staticImagesPath);
        if (staticImagesPathExists === false) {
            console.log('Cleaned up static images directory...');
        }
        else {
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
//# sourceMappingURL=server.js.map