import knex from 'knex';
import config from '../config/config';

const createDbCon = () => {
  const connection = knex({
    client: 'pg',
    connection: {
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      user: config.DB_USER,
      password: config.DB_PASS,
      database: config.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 0,
      max: 100,
    },
  });

  console.log('Trabill OTA Database Is Connected...💻');
  return connection;
};

export const db = createDbCon();
