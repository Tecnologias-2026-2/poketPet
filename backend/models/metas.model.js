const pool = require('../database/db');

const listar = async (usuario_id) =>
  (await pool.query(
    'SELECT * FROM metas WHERE usuario_id = $1 ORDER BY id',
    [usuario_id]
  )).rows;

const crear = async ({ usuario_id, nombre, icono, color, monto_meta, fecha_estimada }) =>
  (await pool.query(
    `INSERT INTO metas (usuario_id, nombre, icono, color, monto_meta, fecha_estimada)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [usuario_id, nombre, icono, color, monto_meta, fecha_estimada]
  )).rows[0];

const actualizar = async (id, usuario_id, { nombre, icono, color, monto_meta, fecha_estimada, activa }) =>
  (await pool.query(
    `UPDATE metas
     SET nombre = $1, icono = $2, color = $3, monto_meta = $4, fecha_estimada = $5, activa = $6
     WHERE id = $7 AND usuario_id = $8 RETURNING *`,
    [nombre, icono, color, monto_meta, fecha_estimada, activa, id, usuario_id]
  )).rows[0];

const eliminar = async (id, usuario_id) =>
  (await pool.query(
    'DELETE FROM metas WHERE id = $1 AND usuario_id = $2',
    [id, usuario_id]
  )).rowCount;

module.exports = { listar, crear, actualizar, eliminar };
