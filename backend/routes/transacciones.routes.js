const router = require('express').Router();
const c = require('../controllers/transacciones.controller');

router.get('/saldo', c.saldo);
router.get('/resumen-mes', c.resumenMes);
router.get('/', c.listar);
router.post('/', c.crear);

module.exports = router;