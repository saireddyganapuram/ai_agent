import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisClient.on("connect", () => {
    console.log("Redis client connected");
});

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});

export default redisClient;
