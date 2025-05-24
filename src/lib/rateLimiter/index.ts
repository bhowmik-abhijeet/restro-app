import { IRateLimitStrategy } from "./strategies/types";

export interface IRateLimitOptions {
  strategy: IRateLimitStrategy;
}

export class RateLimiter {
  strategy: IRateLimitStrategy;
  constructor(options: IRateLimitOptions) {
    this.strategy = options.strategy;
  }

  handle(req: any, res: any, next: any) {
    this.strategy
      .forward(req.id)
      .then(next)
      .catch((err) => {
        console.warn("WARNING: Rate-limiting ", req.id);
        res.status(429).send(err.message);
      });
  }
}
