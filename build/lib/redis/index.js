"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hash = exports.Lock = exports.client = void 0;
var lock_1 = require("./lock");
var hash_1 = require("./hash");
var config_1 = require("../../config");
var redis = require("redis");
var cfg = config_1.config.get('redis');
exports.client = redis.createClient({
    url: "redis://".concat(cfg.username, ":").concat(cfg.password, "@").concat(cfg.host, ":").concat(cfg.port),
});
process.nextTick(function () {
    exports.client.on("error", function (err) { return console.log("Redis Client Error", err); });
    exports.client
        .connect()
        .then(function () { return console.log("Redis connected"); })
        .catch(function (err) { return console.log(err); });
});
exports.Lock = lock_1.Lock;
exports.Hash = hash_1.Hash;
