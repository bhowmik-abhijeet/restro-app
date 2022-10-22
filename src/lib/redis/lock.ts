import { client } from ".";
import { ILock } from "./types";
const namespace = "LOCK:";

export class Lock implements ILock {
  key: string;
  expiryInSec: number;
  val: string;
  constructor(key: string, expiryInSec: number = 10) {
    this.key = key;
    this.expiryInSec = expiryInSec;
    this.val = Date.now().toString() + ":" + Math.floor(Math.random() * 100); // unixtimestamp:random_num_bw_0_100
  }

  static getHashKey(key: any): string {
    return namespace + key;
  }

  async acquire(): Promise<boolean> {
    let key = Lock.getHashKey(this.key);
    const script = `if redis.call('SETNX', '${key}', '${this.val}') == 1 then redis.call('EXPIRE', '${key}', ${this.expiryInSec}) return 1 else return 0 end`;
    /**
     * if redis.call('SETNX', ARGV[1], ARGV[2]) == 1
     * then
     *  redis.call('EXPIRE', ARGV[1], ARGV[3])
     *  return 1
     * else
     *  return 0
     * end
     */
    let res = await client.eval(script, 0);
    return res === 1;
  }

  async release(): Promise<boolean> {
    let key = Lock.getHashKey(this.key);
    const script = `if redis.call('GET', '${key}') == '${this.val}' then redis.call('del', '${key}') return 1 else return 0 end`;
    /**
     * if redis.call('GET', ARGV[1]) == ARGV[2]
     * then
     *  redis.call('del', ARGV[1])
     *  return 1
     * else
     *  return 0
     * end
     */
    let res = await client.eval(script, 0);
    return res === 1;
  }
}
