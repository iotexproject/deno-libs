import Redis from 'npm:ioredis';
import DataLoader, { CacheMap } from 'npm:dataloader';

export class RedisCache implements CacheMap<any, any> {
  options: { ttl: number; allowStale?: boolean; prefix?: string } = { ttl: 1000 * 30, allowStale: false, prefix: '' };
  redis: Redis;
  dataloader: DataLoader<string[], any, any> = new DataLoader(
    async (keys) => {
      const pipeline = this.redis.pipeline();
      keys.forEach((command) => {
        const [method, ...args] = command;
        pipeline[method](...args);
      });
      const res = await pipeline.exec();
      return res;
    },
    { cache: false },
  );

  constructor(args: Partial<RedisCache>) {
    // Object.assign(this, args);
    this.redis = args.redis;
    this.options = { ...this.options, ...args.options };
    if (!this.redis) {
      throw new Error('missing redis db');
    }
  }

  async get(_key) {
    const key = this.options.prefix + _key;
    console.time('get ' + key);
    const res = await this.dataloader.load(['get', key]);
    console.timeEnd('get ' + key);
    const data = res[1] ? JSON.parse(res[1]) : null;
    if (!data) return;
    return data?.value;
  }

  async set(_key, value, options?: { ttl?: number }) {
    const key = this.options.prefix + _key;
    const now = new Date();
    const expiration = now.setTime(now.getTime() + (options?.ttl || this.options.ttl));
    const data = { value, expiration };
    await this.dataloader.load(['set', key, JSON.stringify(data)]);
    return this;
  }
  async delete(key) {
    return this.dataloader.load(['del', key]);
  }
  async clear() {}

  async wrap<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>>(key, fn: T, args?: { ttl?: number }): Promise<Awaited<U>> {
    let data = await this.get(key);
    if (data?.expiration && new Date(data?.expiration) <= new Date()) {
      data = null;
    }
    if (!data) {
      console.time('wrap -> ' + key);
      data = await fn();
      console.timeEnd('wrap -> ' + key);
      await this.set(key, data, args);
    }
    return data;
  }
}


// const { REDIS_URL = 'redis://34.146.117.200:6379/1' } = {} as any;
// export const redis = new Redis(REDIS_URL);
// export const cache = new RedisCache({ redis, options: { ttl: 1000 * 30, allowStale: true } });
