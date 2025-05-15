// scripts/clear-redis.js
import 'dotenv/config'; // 👈 important
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URI;

if (!REDIS_URL) {
  console.error('❌ REDIS_URL is not set.');
  process.exit(1);
}

const redis = new Redis(REDIS_URL);

async function flushRedis() {
  try {
    await redis.flushdb();
    console.log('✅ Redis database cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing Redis database:', error);
  } finally {
    redis.disconnect();
  }
}

flushRedis();
