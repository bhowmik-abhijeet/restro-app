export interface IRateLimitStrategy {
  forward(key: string): Promise<void>;
}

export interface ITokenBucketRateLimitStrategyOptions {
  bucketSizePerKey: number;
  refillPerUnitTime: number;
  unitTimeInMs: number;
  context: string;
}
