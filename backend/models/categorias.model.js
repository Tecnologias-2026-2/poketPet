const { comoUsuario } = require('../database/db');

exports.listar = (uid) => comoUsuario(uid, async (db) =>
  (await db.query('SELECT * FROM v_categorias_progreso ORDER BY id')).rows);

exports.crear = (uid, c) => comoUsuario(uid, async (db) =>
  (await db.query(
    `INSERT INTO categorias (usuario_id, nombre, icono, color, monto_objetivo, frecuencia, dia_pago)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [uid, c.nombre, c.icono, c.color, c.monto, c.frecuencia, c.fecha]
  )).rows[0]);

// Reiniciar empieza un ciclo nuevo: los abonos anteriores dejan de contarse
exports.reiniciar = (uid, id) => comoUsuario(uid, async (db) =>
  (await db.query(
    'UPDATE categorias SET ciclo_inicio = now() WHERE id = $1 RETURNING *', [id]
  )).rows[0]);