import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

export async function initializeDatabase() {
  const pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: parseInt(process.env.DB_POOL_MIN || '1', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10)
  });
  console.log("✅ Oracle Database bilan Connection Pool muvaffaqiyatli ishga tushdi");
  return pool;
}

export async function executeQuery(sql, binds = {}, opts = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error("SQL Xatolik:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Ulanishni yopishda xatolik:", err);
      }
    }
  }
}
