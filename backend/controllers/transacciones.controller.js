const Transaccion = require('../models/transacciones.model');
const manejar = require('../middlewares/manejar');

exports.saldo = manejar(async (req, res) =>
  res.json({ saldo: await Transaccion.saldo(req.usuarioId) }));

exports.resumenMes = manejar(async (req, res) =>
  res.json(await Transaccion.resumenMes(req.usuarioId)));

exports.listar = manejar(async (req, res) =>
  res.json(await Transaccion.listar(req.usuarioId, Number(req.query.limite) || 10)));

exports.crear = manejar(async (req, res) =>
  res.status(201).json(await Transaccion.crear(req.usuarioId, req.body)));