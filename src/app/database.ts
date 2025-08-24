import knex from 'knex';
import config from '../config/config';
import { cors_origin_name } from '../utils/miscellaneous/constants';
import { client } from './redis';

const createDbCon = (): knex.Knex<any, unknown[]> => {
  const connection = knex({
    client: 'pg',
    connection: {
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      user: config.DB_USER,
      password: config.DB_PASS,
      database: config.DB_NAME,
      // ssl: {
      //   rejectUnauthorized: false,
      // },
    },
    pool: {
      min: 0,
      max: 100,
    },
  });

  return connection;
};

export const setUpCorsOrigin = async () => {
  try {
    const originsDbs = (await db('cors_origins')
      .select('id', 'name')
      .where('status', true)) as { id: number; name: string }[];
    const origins = originsDbs.map((item) => item.name);
    await client.del(cors_origin_name);
    client.set(cors_origin_name, JSON.stringify(origins));
    console.log('New Cors Set Up Successfully...');
  } catch (error) {
    console.log('Error setting up CORS origins:', error);
  }
};

export const db = createDbCon();
