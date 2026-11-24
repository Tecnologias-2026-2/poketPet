const { comoUsuario } = require('../database/db');

exports.saldo = (uid) => comoUsuario(uid, async (db) => {
  const { rows } = await db.query('SELECT saldo FROM v_saldo');
  return rows[0] ? Number(rows[0].saldo) : 0;
});

exports.resumenMes = (uid) => comoUsuario(uid, async (db) => {
  const { rows } = await db.query(`
    SELECT tipo, SUM(monto) AS total FROM transacciones
    WHERE tipo IN ('ingreso', 'retiro', 'abono_categoria')
      AND fecha >= date_trunc('month', now() AT TIME ZONE 'America/Bogota') AT TIME ZONE 'America/Bogota'
    GROUP BY tipo`);
  const resumen = { ingresos: 0, gastos: 0 };
  rows.forEach((f) => {
    if (f.tipo === 'ingreso') resumen.ingresos += Number(f.total);
    else resumen.gastos += Number(f.total);
  });
  return resumen;
});

exports.listar = (uid, limite) => comoUsuario(uid, async (db) =>
  (await db.query(
    'SELECT tipo, monto, fecha FROM transacciones ORDER BY fecha DESC LIMIT $1', [limite]
  )).rows);

exports.crear = (uid, { tipo, monto, categoria_id, meta_id }) => comoUsuario(uid, async (db) =>
  (await db.query(
    `INSERT INTO transacciones (usuario_id, tipo, monto, categoria_id, meta_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [uid, tipo, monto, categoria_id ?? null, meta_id ?? null]
  )).rows[0]);