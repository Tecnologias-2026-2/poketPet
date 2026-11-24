require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/metas', require('./routes/metas.routes'));

app.listen(process.env.PORT || 3000, () =>
  console.log('API Pocket Pet en http://localhost:' + (process.env.PORT || 3000))
);