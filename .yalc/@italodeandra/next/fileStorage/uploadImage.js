"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.uploadImage = void 0;
var sharp_1 = __importDefault(require("sharp"));
var connectToFileStorage_1 = __importDefault(require("./connectToFileStorage"));
var converters_1 = require("./converters");
function uploadImage(image, objectName, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
metaData) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStorage, buffer, resizedBuffer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.APP_ENV === "development") {
                        return [2 /*return*/, image];
                    }
                    if (!(image === null || image === void 0 ? void 0 : image.startsWith("data:"))) {
                        return [2 /*return*/, image];
                    }
                    return [4 /*yield*/, (0, connectToFileStorage_1.default)()];
                case 1:
                    fileStorage = _a.sent();
                    buffer = (0, converters_1.base64ToBuffer)(image);
                    return [4 /*yield*/, (0, sharp_1.default)(buffer)
                            .resize({
                            width: 500,
                            withoutEnlargement: true,
                            fastShrinkOnLoad: true,
                        })
                            .toBuffer()];
                case 2:
                    resizedBuffer = _a.sent();
                    objectName = "".concat(objectName, ".jpg");
                    if (!process.env.S3_BUCKET_NAME) {
                        throw Error("Missing S3_BUCKET_NAME env var");
                    }
                    return [4 /*yield*/, fileStorage.putObject(process.env.S3_BUCKET_NAME, objectName, resizedBuffer, __assign({ "Content-Type": "image/jpeg" }, metaData))];
                case 3:
                    result = _a.sent();
                    if (!result.etag) {
                        throw Error("There was an unexpected error trying to upload \"".concat(image, "\""));
                    }
                    return [2 /*return*/, "/file/".concat(objectName)];
            }
        });
    });
}
exports.uploadImage = uploadImage;
function uploadFile(file, objectFileName, contentType, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
metaData) {
    return __awaiter(this, void 0, void 0, function () {
        var fileStorage, buffer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.env.APP_ENV === "development") {
                        return [2 /*return*/, file];
                    }
                    if (!(file === null || file === void 0 ? void 0 : file.startsWith("data:"))) {
                        return [2 /*return*/, file];
                    }
                    return [4 /*yield*/, (0, connectToFileStorage_1.default)()];
                case 1:
                    fileStorage = _a.sent();
                    buffer = (0, converters_1.base64ToBuffer)(file);
                    if (!process.env.S3_BUCKET_NAME) {
                        throw Error("Missing S3_BUCKET_NAME env var");
                    }
                    return [4 /*yield*/, fileStorage.putObject(process.env.S3_BUCKET_NAME, objectFileName, buffer, __assign({ "Content-Type": contentType }, metaData))];
                case 2:
                    result = _a.sent();
                    if (!result.etag) {
                        throw Error("There was an unexpected error trying to upload \"".concat(file, "\""));
                    }
                    return [2 /*return*/, "/file/".concat(objectFileName)];
            }
        });
    });
}
exports.uploadFile = uploadFile;
