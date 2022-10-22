import { client } from ".";
const namespace = "HASH:";

export class Hash {
  static getHashKey(key: any): string {
    return namespace + key;
  }
  static async get(key: any): Promise<any> {
    const val = await client.hGetAll(this.getHashKey(key));
    return JSON.parse(JSON.stringify(val));
  }

  static async set(key: any, obj: any) {
    return client.hSet(this.getHashKey(key), obj);
  }
}
