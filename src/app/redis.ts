import { createClient } from 'redis';
import { Queue, Worker } from 'bullmq';

const redis_url = 'redis://localhost';

export const client = createClient({ url: redis_url });

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

export const setRedis = async (key: string, value: any, ex = 900) => {
  await client.setEx(key, ex, JSON.stringify(value));
};

export const getRedis = async (key: string) => {
  if (await client.exists(key)) {
    const retrievedData = (await client.get(key)) as string;

    return JSON.parse(retrievedData);
  } else {
    return null;
  }
};

export const getRedisTTL = async (key: string): Promise<number> => {
  const ttl = await client.ttl(key);
  return ttl;
};

export const deleteRedis = async (key: string) => {
  await client.del(key);
};
export const redisFlush = async () => {
  await client.flushAll();
};

const redisConfig = {
  connection: {
    host: 'localhost',
    port: 6379,
  },
};

const emailQueue = new Queue('emailQueue', redisConfig);

const worker = new Worker(
  'emailQueue',
  async (job) => {
    const { to, subject, text, html } = job.data;

    try {
      // const info = await transporter.sendMail({
      //   from: '"Your Service" <noreply@yourservice.com>',
      //   to,
      //   subject,
      //   text,
      //   html,
      // });
      // console.log('Email sent:', info.messageId);
      // return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error; // This will trigger a retry if configured
    }
  },
  redisConfig
);
