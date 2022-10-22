"use strict";
var express = require("express");
var app = express();
var port = 3000;
var orderService = require("./orderService");
var bodyParser = require("body-parser");
var RateLimiter = require("./lib/rateLimiter").RateLimiter;
var TokenBucketRateLimitStrategy = require("./lib/rateLimiter/strategies/tokenBucket").TokenBucketRateLimitStrategy;
var rateLimitStrategy = new TokenBucketRateLimitStrategy().init({
    bucketSizePerKey: 5,
    refillPerUnitTime: 2,
    unitTimeInMs: 5 * 1000, // 1 min
});
var rateLimiter = new RateLimiter({ strategy: rateLimitStrategy });
var allowedAuthTokens = ["1234", "5432", "8976"];
app.use(bodyParser.json());
app.use(function (req, res, next) {
    req.id = req.headers["authorization"];
    if (allowedAuthTokens.indexOf(req.id) === -1)
        return res.status(401).send("Unauthorized");
    next();
});
// rate-limiter
app.use(rateLimiter.handle.bind(rateLimiter));
app.use("/", function (req, res) {
    return res.send("Hello World");
});
app.use("/orders", orderService);
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
