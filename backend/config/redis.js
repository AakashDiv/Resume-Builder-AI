import IORedis from "ioredis";
import { env } from "./env.js";

export function getRedisConnectionOptions() {
  const url = new URL(env.redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: url.pathname && url.pathname !== "/" ? Number(url.pathname.slice(1)) : 0,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: url.protocol === "rediss:" ? {} : undefined
  };
}

export function createRedisClient(options = {}) {
  return new IORedis({
    ...getRedisConnectionOptions(),
    ...options
  });
}

export async function pingRedis() {
  const client = createRedisClient({ lazyConnect: true });
  client.on("error", () => {});
  try {
    await client.connect();
    return await client.ping();
  } finally {
    await client.quit().catch(() => {});
  }
}
