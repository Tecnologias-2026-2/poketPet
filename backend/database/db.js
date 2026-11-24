require('dotenv').config();
const { Pool,types } = require('pg');

types.setTypeParser(20, (v) => parseInt(v, 10)); // ids como número, igual que antes
types.setTypeParser(1082, (v) => v);             // fechas como '2026-11-28', no como Date
const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST, user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    };

const pool = new Pool({ ...config, ssl: { rejectUnauthorized: false } });

// Ejecuta las consultas como el usuario autenticado, para que se apliquen
// las mismas reglas (seguridad por fila, vistas, triggers) que antes.
async function comoUsuario(usuarioId, trabajo) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    await db.query(
      "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)",
      [usuarioId, JSON.stringify({ sub: usuarioId, role: 'authenticated' })]
    );
    await db.query('SET LOCAL ROLE authenticated');
    const resultado = await trabajo(db);
    await db.query('COMMIT');
    return resultado;
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    db.release();
  }
}

module.exports = { pool, comoUsuario };