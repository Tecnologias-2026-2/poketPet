const { comoUsuario } = require('../database/db');

exports.listar = (uid) => comoUsuario(uid, async (db) =>
  (await db.query('SELECT * FROM v_metas_progreso ORDER BY id')).rows);

exports.crear = (uid, m) => comoUsuario(uid, async (db) =>
  (await db.query(
    `INSERT INTO metas (usuario_id, nombre, icono, color, monto_meta, fecha_estimada)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [uid, m.nombre, m.icono, m.color, m.monto, m.fecha]
  )).rows[0]);

exports.movimientos = (uid, id) => comoUsuario(uid, async (db) =>
  (await db.query(
    'SELECT tipo, monto, fecha FROM transacciones WHERE meta_id = $1 ORDER BY fecha DESC LIMIT 5', [id]
  )).rows);

// Eliminar = devolver lo ahorrado al saldo y marcar la meta como inactiva.
// El monto se calcula aquí, en el servidor, no lo manda el navegador.
exports.eliminar = (uid, id) => comoUsuario(uid, async (db) => {
  const { rows } = await db.query('SELECT ahorrado FROM v_metas_progreso WHERE id = $1', [id]);
  if (!rows[0]) return false;
  const ahorrado = Number(rows[0].ahorrado);
  if (ahorrado > 0) {
    await db.query(
      "INSERT INTO transacciones (usuario_id, tipo, monto, meta_id) VALUES ($1, 'retiro_meta', $2, $3)",
      [uid, ahorrado, id]
    );
  }
  await db.query('UPDATE metas SET activa = false WHERE id = $1', [id]);
  return true;
});
