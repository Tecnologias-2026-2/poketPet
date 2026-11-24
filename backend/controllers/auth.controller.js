const Auth = require('../models/auth.model');
const manejar = require('../middlewares/manejar');

exports.registro = manejar(async (req, res) => {
  const { nombre, correo, clave } = req.body;
  const { data, error } = await Auth.registrar(correo, clave, nombre);
  if (error) return res.status(error.status || 400).json({ error: error.message });
  const yaRegistrado = !!(data.user && data.user.identities && data.user.identities.length === 0);
  res.status(201).json({ yaRegistrado, sesion: data.session });
});

exports.login = manejar(async (req, res) => {
  const { correo, clave } = req.body;
  const { data, error } = await Auth.iniciarSesion(correo, clave);
  if (error) return res.status(error.status || 401).json({ error: error.message });
  res.json({ sesion: data.session });
});