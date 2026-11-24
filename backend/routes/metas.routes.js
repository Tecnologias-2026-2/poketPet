const router = require('express').Router();
const c = require('../controllers/metas.controller');

router.get('/', c.listar);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
