import { Lock as _Lock } from "./lock";
import { Hash as _Hash } from "./hash";
import { config } from "../../config";

const redis = require("redis");

const cfg = config.get('redis');
export const client = redis.createClient({
  url: `redis://${cfg.username}:${cfg.password}@${cfg.host}:${cfg.port}`,
});

process.nextTick(() => {
  client.on("error", (err: Error) => console.log("Redis Client Error", err));
  client
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err: Error) => console.log(err));
});

export const Lock = _Lock;
export const Hash = _Hash;
