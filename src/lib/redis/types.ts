export interface ILock {
  acquire(): Promise<boolean>;
  release(): Promise<boolean>;
}

export interface IQueue {
  push(val: string): Promise<number>;
  ltrim(len: number): Promise<number>;
  len(): Promise<number>;
}

export interface IQueueOptions {
  size: number;
  key: string;
}
