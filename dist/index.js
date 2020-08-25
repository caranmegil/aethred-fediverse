"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
var megalodon_1 = __importDefault(require("megalodon"));
var superagent_1 = __importDefault(require("superagent"));
var rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
var SCOPES = ['read', 'write', 'follow'];
var BASE_URL = 'https://chilli.social';
var clientId;
var clientSecret;
var client = megalodon_1.default('pleroma', BASE_URL);
client
    .registerApp('aethred', {
    scopes: SCOPES
})
    .then(function (appData) {
    clientId = appData.clientId;
    clientSecret = appData.clientSecret;
    console.log('Authorization URL is generated.');
    console.log(appData.url);
    console.log();
    return new Promise(function (resolve) {
        rl.question('Enter the authorization code from website: ', function (code) {
            resolve(code);
            rl.close();
        });
    });
})
    .then(function (code) {
    console.log(process.env.SECOND_STAGE_HOST + "/?code=" + code + "&clientId=" + clientId + "&secret=" + clientSecret);
    superagent_1.default.get(process.env.SECOND_STAGE_HOST + "/?code=" + code + "&clientId=" + clientId + "&secret=" + clientSecret).end();
});
