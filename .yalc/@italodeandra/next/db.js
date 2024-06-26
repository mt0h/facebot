"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.clearPromise = exports.connectDb = exports.client = void 0;
var mongodb_1 = require("mongodb");
var papr_1 = __importDefault(require("papr"));
var isServer_1 = require("./utils/isServer");
var uri = process.env.MONGODB_URI;
var appEnv = process.env.APP_ENV;
var options = {};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var papr = (global._papr = global._papr || (0, isServer_1.onlyServer)(function () { return new papr_1.default(); }));
function connectDb(afterConnected) {
    return __awaiter(this, void 0, void 0, function () {
        var connect;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (global._dbPromise) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return [2 /*return*/, global._dbPromise];
                    }
                    connect = function () { return __awaiter(_this, void 0, void 0, function () {
                        var MongoMemoryServer, mongod, _i, afterConnected_1, runAfterConnected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(!uri && appEnv !== "production")) return [3 /*break*/, 3];
                                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("mongodb-memory-server")); })];
                                case 1:
                                    MongoMemoryServer = (_a.sent()).MongoMemoryServer;
                                    return [4 /*yield*/, MongoMemoryServer.create({
                                            instance: {
                                                port: 5432,
                                                dbName: process.env.MONGODB_MEMORY_SERVER_DBNAME,
                                            },
                                        })];
                                case 2:
                                    mongod = _a.sent();
                                    uri = "".concat(mongod.getUri()).concat(process.env.MONGODB_MEMORY_SERVER_DBNAME || "test");
                                    _a.label = 3;
                                case 3:
                                    if (!uri) {
                                        throw Error("[MongoDB] URI not found");
                                    }
                                    exports.client = new mongodb_1.MongoClient(uri, options);
                                    return [4 /*yield*/, exports.client.connect()];
                                case 4:
                                    _a.sent();
                                    papr.initialize(exports.client.db());
                                    return [4 /*yield*/, papr.updateSchemas()];
                                case 5:
                                    _a.sent();
                                    if (!afterConnected) return [3 /*break*/, 9];
                                    _i = 0, afterConnected_1 = afterConnected;
                                    _a.label = 6;
                                case 6:
                                    if (!(_i < afterConnected_1.length)) return [3 /*break*/, 9];
                                    runAfterConnected = afterConnected_1[_i];
                                    return [4 /*yield*/, runAfterConnected(exports.client.db())];
                                case 7:
                                    _a.sent();
                                    _a.label = 8;
                                case 8:
                                    _i++;
                                    return [3 /*break*/, 6];
                                case 9:
                                    console.info("[MongoDB] Connected to \"".concat(uri, "\""));
                                    return [2 /*return*/, papr];
                            }
                        });
                    }); };
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    global._dbPromise = connect();
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return [4 /*yield*/, global._dbPromise];
                case 1:
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.connectDb = connectDb;
function clearPromise() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global._dbPromise;
}
exports.clearPromise = clearPromise;
exports.default = papr;
