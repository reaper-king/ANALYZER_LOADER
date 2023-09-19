import { Pool } from 'pg';
const db_conf = {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
};
const pool = new Pool(db_conf);
export default pool;
