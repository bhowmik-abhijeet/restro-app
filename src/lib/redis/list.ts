import { client } from ".";
import { IQueue, IQueueOptions } from "./types";
const namespace = "LIST:";

export class Queue implements IQueue {
  size: number;
  key: string;
  constructor(options: IQueueOptions) {
    this.size = options.size;
    this.key = options.key;
  }

  static getHashKey(key: any): string {
    return namespace + key;
  }

  async len(): Promise<number> {
    return client.LLEN(Queue.getHashKey(this.key));
  }

  async push(val: string): Promise<number> {
    return client.LPUSH(Queue.getHashKey(this.key), val);
  }

  async ltrim(len: number): Promise<number> {
    await client.LTRIM(Queue.getHashKey(this.key), len, this.size);
    return this.len();
  }
}
