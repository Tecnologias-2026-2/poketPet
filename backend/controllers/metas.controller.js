const Meta = require('../models/metas.model');
const manejar = require('../middlewares/manejar');

exports.listar = manejar(async (req, res) =>
  res.json(await Meta.listar(req.usuarioId)));

exports.crear = manejar(async (req, res) =>
  res.status(201).json(await Meta.crear(req.usuarioId, req.body)));

exports.movimientos = manejar(async (req, res) =>
  res.json(await Meta.movimientos(req.usuarioId, req.params.id)));

exports.eliminar = manejar(async (req, res) => {
  const ok = await Meta.eliminar(req.usuarioId, req.params.id);
  ok ? res.status(204).end() : res.status(404).json({ error: 'Meta no encontrada' });
});