"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
var RateLimiter = /** @class */ (function () {
    function RateLimiter(options) {
        this.strategy = options.strategy;
    }
    RateLimiter.prototype.handle = function (req, res, next) {
        this.strategy
            .forward(req.id)
            .then(next)
            .catch(function (err) {
            res.status(429).send(err.message);
        });
    };
    return RateLimiter;
}());
exports.RateLimiter = RateLimiter;
