import { Lock as _Lock } from "./lock";
import { Hash as _Hash } from "./hash";

const redis = require("redis");

export const client = redis.createClient({
  url: "redis://default:password@localhost:6379",
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
