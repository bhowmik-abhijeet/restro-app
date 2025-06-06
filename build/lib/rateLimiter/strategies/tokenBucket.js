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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucketRateLimitStrategy = void 0;
var redis = __importStar(require("../../redis"));
var min = function (i, j) { return (i < j ? i : j); };
var TokenBucketRateLimitStrategy = /** @class */ (function () {
    function TokenBucketRateLimitStrategy() {
        this.bucketSizePerKey = 0;
        this.refillPerUnitTime = 0;
        this.unitTimeInMs = 0;
        this.context = "default";
    }
    TokenBucketRateLimitStrategy.prototype.init = function (options) {
        Object.assign(this, options);
        return this;
    };
    // 10:01
    TokenBucketRateLimitStrategy.prototype.refill = function (bucket) {
        var timeElapsedSinceLastRefill = Date.now() - bucket.lastRefillTs;
        var numberOfUnitTimeElapsed = timeElapsedSinceLastRefill / this.unitTimeInMs;
        if (numberOfUnitTimeElapsed > 1) {
            // atleast 1 unit time should have elapsed
            var tokensToRefill = Math.floor(
            // 24
            this.refillPerUnitTime * numberOfUnitTimeElapsed);
            bucket.tokens = min(
            // 5
            bucket.tokens + tokensToRefill, // 0 + 24
            this.bucketSizePerKey // 5
            );
            bucket.lastRefillTs = Date.now();
        }
        return bucket;
    };
    // 10:00
    TokenBucketRateLimitStrategy.prototype.fill = function () {
        var bucket = {
            tokens: this.bucketSizePerKey,
            lastRefillTs: Date.now(),
        };
        return bucket;
    };
    TokenBucketRateLimitStrategy.prototype.forward = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, lock, locked, bucket, leaked;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = this.context + ":" + requestId;
                        lock = new redis.Lock(key, 5);
                        return [4 /*yield*/, lock.acquire()];
                    case 1:
                        locked = _a.sent();
                        if (!locked)
                            return [2 /*return*/, Promise.reject(new Error("Server Busy"))];
                        return [4 /*yield*/, redis.Hash.get(key)];
                    case 2:
                        bucket = _a.sent();
                        if (Object.entries(bucket).length === 0) {
                            bucket = this.fill(); // -1 for current request
                        }
                        else {
                            bucket.tokens = parseInt(bucket.tokens);
                            bucket = this.refill(bucket);
                        }
                        leaked = bucket.tokens === 0;
                        if (!(bucket.tokens > 0)) return [3 /*break*/, 4];
                        bucket.tokens -= 1;
                        return [4 /*yield*/, redis.Hash.set(key, bucket)];
                    case 3:
                        _a.sent(); // update the bucket in the redis
                        _a.label = 4;
                    case 4: return [4 /*yield*/, lock.release()];
                    case 5:
                        if (!(_a.sent()))
                            console.log("Warning!! Lock expired implicitly. Possible bottleneck");
                        if (leaked)
                            return [2 /*return*/, Promise.reject(new Error("Limit exceeded"))];
                        return [2 /*return*/];
                }
            });
        });
    };
    return TokenBucketRateLimitStrategy;
}());
exports.TokenBucketRateLimitStrategy = TokenBucketRateLimitStrategy;
