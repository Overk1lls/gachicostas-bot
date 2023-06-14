export default () => ({
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
});
