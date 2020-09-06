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
var megalodon_1 = __importDefault(require("megalodon"));
var koa_1 = __importDefault(require("koa"));
var koa_router_1 = __importDefault(require("koa-router"));
var superagent_1 = __importDefault(require("superagent"));
var SCOPES = ['read', 'write', 'follow'];
var BASE_URL = "https://" + process.env.HOST || 'https://chilli.social';
var accessToken;
var refreshToken;
var app = new koa_1.default();
var router = new koa_router_1.default();
var client = megalodon_1.default('pleroma', BASE_URL);
router.get("/", function (ctx, _) { return __awaiter(void 0, void 0, void 0, function () {
    var code, clientId, secret;
    return __generator(this, function (_a) {
        code = ctx.request.query.code;
        clientId = ctx.request.query.clientId;
        secret = ctx.request.query.secret;
        client
            .registerApp('aethred', {
            scopes: SCOPES
        })
            .then(function (appData) {
            console.log('Authorization URL is generated.');
            console.log(appData.url);
            console.log();
            return client.fetchAccessToken(clientId, secret, code);
        })
            .then(function (tokenData) {
            accessToken = tokenData.accessToken;
            refreshToken = tokenData.refreshToken;
            console.log('\naccess_token:');
            console.log(accessToken);
            console.log('\nrefresh_token:');
            console.log(refreshToken);
            console.log();
            var activeClient = megalodon_1.default('pleroma', "https://" + process.env.HOST, accessToken);
            activeClient.getPublicTimeline().then(function (resp) {
                resp.data.forEach(function (value) {
                    console.log('-->' + encodeURI(process.env.PERMISSIONS_HOST + "/fediverse/" + value.account.acct));
                    superagent_1.default
                        .get(encodeURI(process.env.PERMISSIONS_HOST + "/fediverse/" + value.account.acct))
                        .then(function (res) {
                        console.log('-->' + res.body.results);
                        var permissions = res.body.results;
                        if ((permissions.indexOf("master") > -1 || permissions.indexOf("commander") >= -1) && value.content.includes(process.env.NAME + "@" + process.env.HOST)) {
                            superagent_1.default
                                .post(process.env.LINGUA_HOST + "/")
                                .send({ text: value.content })
                                .then(function (resl) {
                                console.log("-->" + resl.body.response);
                            });
                        }
                    })
                        .catch(function (err) {
                        console.log(err);
                    });
                });
            });
        })
            .catch(function (err) { return console.error(err); });
        return [2];
    });
}); });
app.use(router.routes())
    .use(router.allowedMethods());
app.listen(process.env.PORT || 4000, function () {
    console.log('Koa started');
});
