"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hash = exports.Lock = exports.client = void 0;
var lock_1 = require("./lock");
var hash_1 = require("./hash");
var redis = require("redis");
exports.client = redis.createClient({
    url: "redis://default:password@localhost:6379",
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
