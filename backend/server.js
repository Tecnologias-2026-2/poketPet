require('dotenv').config();
const path = require('path');                                  // NUEVO
const express = require('express');
const cors = require('cors');
const requiereSesion = require('./middlewares/requiereSesion');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/transacciones', requiereSesion, require('./routes/transacciones.routes'));
app.use('/api/categorias', requiereSesion, require('./routes/categorias.routes'));
app.use('/api/metas', requiereSesion, require('./routes/metas.routes'));

/* PAGINAS DEL FRONTEND (carpeta public) */                      // NUEVO
app.use(express.static(path.join(__dirname, 'public')));         // NUEVO
app.get('/', (req, res) => res.redirect('/landingpage.html'));   // NUEVO

app.use((err, req, res, next) => {
  if (err.code === 'P0001') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => console.log('API Pocket Pet en http://localhost:' + puerto));