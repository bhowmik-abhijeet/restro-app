const express = require("express");
const app = express();
const port = 3000;
const orderService = require("./orderService");
const bodyParser = require("body-parser");
const RateLimiter = require("./lib/rateLimiter").RateLimiter;
const TokenBucketRateLimitStrategy =
  require("./lib/rateLimiter/strategies/tokenBucket").TokenBucketRateLimitStrategy;

const rateLimitStrategy = new TokenBucketRateLimitStrategy().init({
  bucketSizePerKey: 5,
  refillPerUnitTime: 2,
  unitTimeInMs: 5 * 1000, // 1 min
});
const rateLimiter = new RateLimiter({ strategy: rateLimitStrategy });

const allowedAuthTokens = ["1234", "5432", "8976"];

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.id = req.headers["authorization"];
  if (allowedAuthTokens.indexOf(req.id) === -1)
    return res.status(401).send("Unauthorized");
  next();
});

// rate-limiter
app.use(rateLimiter.handle.bind(rateLimiter));

app.use("/", (req, res) => {
  return res.send("Hello World");
});
app.use("/orders", orderService);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
