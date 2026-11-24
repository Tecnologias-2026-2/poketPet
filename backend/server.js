require('dotenv').config();
const path=require("path");
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

const raiz=path.join(__dirname,"..");

app.use('/backend', (req, res) => res.status(404).end()); // no exponer el código del backend
app.use(express.static(raiz));
app.get('/', (req, res) => res.sendFile(path.join(raiz, 'index.html')));
app.use((err, req, res, next) => {
  if (err.code === 'P0001') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => console.log('API Pocket Pet en http://localhost:' + puerto));