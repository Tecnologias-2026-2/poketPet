const router = require('express').Router();
const c = require('../controllers/categorias.controller');

router.get('/', c.listar);
router.post('/', c.crear);
router.post('/:id/reiniciar', c.reiniciar);

module.exports = router;