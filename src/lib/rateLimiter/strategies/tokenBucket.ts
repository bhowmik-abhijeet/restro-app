import * as redis from "../../redis";
import {
  IRateLimitStrategy,
  ITokenBucketRateLimitStrategyOptions,
} from "./types";

interface IBucket {
  tokens: number;
  lastRefillTs: number;
}

const min = (i: number, j: number) => (i < j ? i : j);

export class TokenBucketRateLimitStrategy implements IRateLimitStrategy {
  bucketSizePerKey: number = 0;
  refillPerUnitTime: number = 0;
  unitTimeInMs: number = 0;
  context: string = "default";
  init(
    options: ITokenBucketRateLimitStrategyOptions
  ): TokenBucketRateLimitStrategy {
    Object.assign(this, options);
    return this;
  }
  // 10:01
  refill(bucket: IBucket): IBucket {
    const timeElapsedSinceLastRefill = Date.now() - bucket.lastRefillTs;
    const numberOfUnitTimeElapsed =
      timeElapsedSinceLastRefill / this.unitTimeInMs;

    if (numberOfUnitTimeElapsed > 1) {
      // atleast 1 unit time should have elapsed
      const tokensToRefill = Math.floor(
        // 24
        this.refillPerUnitTime * numberOfUnitTimeElapsed
      );
      bucket.tokens = min(
        // 5
        bucket.tokens + tokensToRefill, // 0 + 24
        this.bucketSizePerKey // 5
      );
      bucket.lastRefillTs = Date.now();
    }
    return bucket;
  }
  // 10:00
  fill(): IBucket {
    const bucket = {
      tokens: this.bucketSizePerKey,
      lastRefillTs: Date.now(),
    };
    return bucket;
  }

  async forward(requestId: string): Promise<void> {
    const key = this.context + ":" + requestId;
    const lock = new redis.Lock(key, 5);
    let locked = await lock.acquire();
    if (!locked) return Promise.reject(new Error("Server Busy"));

    let bucket = await redis.Hash.get(key);

    if (Object.entries(bucket).length === 0) {
      bucket = this.fill(); // -1 for current request
    } else {
      bucket.tokens = parseInt(bucket.tokens);
      bucket = this.refill(bucket);
    }

    const leaked = bucket.tokens === 0; // no tokens left to serve request // 5

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      await redis.Hash.set(key, bucket); // update the bucket in the redis
    }

    if (!(await lock.release()))
      console.log("Warning!! Lock expired implicitly. Possible bottleneck");
    if (leaked) return Promise.reject(new Error("Limit exceeded"));
  }
}
