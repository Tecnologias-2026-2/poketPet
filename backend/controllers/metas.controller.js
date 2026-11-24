const Meta = require('../models/metas.model');

exports.listar = async (req, res) => {
  try { res.json(await Meta.listar(req.query.usuario_id)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.crear = async (req, res) => {
  try { res.status(201).json(await Meta.crear(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
};

exports.actualizar = async (req, res) => {
  try {
    const meta = await Meta.actualizar(req.params.id, req.query.usuario_id, req.body);
    meta ? res.json(meta) : res.status(404).json({ error: 'No encontrada' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.eliminar = async (req, res) => {
  try {
    const n = await Meta.eliminar(req.params.id, req.query.usuario_id);
    n ? res.status(204).end() : res.status(404).json({ error: 'No encontrada' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};