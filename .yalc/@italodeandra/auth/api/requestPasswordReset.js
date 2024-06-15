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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthRequestPasswordReset = void 0;
var User_1 = __importDefault(require("../collections/user/User"));
var User_service_1 = require("../collections/user/User.service");
var react_query_1 = require("@tanstack/react-query");
var errors_1 = require("@italodeandra/next/api/errors");
var apiHandlerWrapper_1 = require("@italodeandra/next/api/apiHandlerWrapper");
var appEnv = process.env.APP_ENV || "development";
function requestPasswordResetHandler(args, req, _res, _a) {
    var _b;
    var routes = _a.routes, connectDb = _a.connectDb, intl = _a.intl, fallbackLocale = _a.fallbackLocale, primaryColor = _a.primaryColor, sendMail = _a.sendMail;
    return __awaiter(this, void 0, void 0, function () {
        var locales, locale, t, User, user, host, protocol, token, url;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!routes.ResetPassword) {
                        throw Error("Missing ResetPassword route");
                    }
                    if (!args.email) {
                        throw errors_1.badRequest;
                    }
                    locales = ((_b = req.headers["accept-language"]) === null || _b === void 0 ? void 0 : _b.split(",").map(function (locale) { return locale.split(";")[0]; })) || [];
                    locale = getFirstAvailableLocale(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    Object.keys(intl), locales, 
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    fallbackLocale);
                    t = intl[locale];
                    return [4 /*yield*/, connectDb()];
                case 1:
                    _c.sent();
                    User = (0, User_1.default)();
                    return [4 /*yield*/, User.findOne({
                            email: args.email.toLowerCase().trim(),
                        }, {
                            projection: {
                                email: 1,
                            },
                        })];
                case 2:
                    user = _c.sent();
                    if (!user)
                        return [2 /*return*/];
                    host = req.headers.host;
                    protocol = /^localhost(:\d+)?$/.test(host) ? "http" : "https";
                    token = (0, User_service_1.generateResetPasswordToken)(user.email);
                    url = "".concat(protocol, "://").concat(host).concat(routes.ResetPassword(token));
                    return [4 /*yield*/, sendMail(user.email, t["Reset your password"], {
                            title: t["Reset your password"],
                            intro: t["We received a request to reset your password"],
                            action: [
                                {
                                    instructions: t["To reset your password click the link below"],
                                    button: {
                                        color: primaryColor,
                                        link: url,
                                        text: t["Click here"],
                                    },
                                },
                            ],
                            outro: [
                                "".concat(t["or copy and paste the following link on your browser"], ": "),
                                "<span style=\"word-wrap: break-word; color: gray; user-select: all;\">".concat(url, "</span>"),
                                "".concat(t["If you didn't request to reset your password, please ignore this email"], "."),
                            ],
                            signature: t["Kind regards"],
                        })];
                case 3:
                    _c.sent();
                    if (appEnv === "development") {
                        console.info("Reset password in URL:", url);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = requestPasswordResetHandler;
function getFirstAvailableLocale(availableLocales, locales, fallbackLocale) {
    for (var _i = 0, locales_1 = locales; _i < locales_1.length; _i++) {
        var locale = locales_1[_i];
        if (availableLocales.includes(locale)) {
            return locale;
        }
    }
    return fallbackLocale;
}
var mutationKey = "/api/auth/requestPasswordReset";
var useAuthRequestPasswordReset = function (options) {
    return (0, react_query_1.useMutation)([mutationKey], (0, apiHandlerWrapper_1.mutationFnWrapper)(mutationKey), options);
};
exports.useAuthRequestPasswordReset = useAuthRequestPasswordReset;
