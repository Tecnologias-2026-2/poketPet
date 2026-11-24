const Categoria = require('../models/categorias.model');
const manejar = require('../middlewares/manejar');

exports.listar = manejar(async (req, res) =>
  res.json(await Categoria.listar(req.usuarioId)));

exports.crear = manejar(async (req, res) =>
  res.status(201).json(await Categoria.crear(req.usuarioId, req.body)));

exports.reiniciar = manejar(async (req, res) => {
  const fila = await Categoria.reiniciar(req.usuarioId, req.params.id);
  fila ? res.json(fila) : res.status(404).json({ error: 'Categoría no encontrada' });
});