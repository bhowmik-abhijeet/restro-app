const express = require("express");
const morgan = require('morgan');
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

app.use(bodyParser.json());
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));
app.use((req, res, next) => {
  req.id = req.ip;
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
