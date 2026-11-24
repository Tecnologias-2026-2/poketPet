var datosApp = (function () {

    function usuarioId() {
        var actual = api.sesion();
        return actual ? Promise.resolve(actual.user.id) : Promise.reject(new Error('Sin sesión'));
    }

    /* Las reglas de la base (saldo insuficiente, maximo 4 metas...) llegan con estado 400
       y ya vienen escritas para el usuario */
    function textoError(error) {
        if (error && error.status === 400) {
            return error.message;
        }
        console.error('Error con la API:', error);
        return 'No se pudo guardar. Revisa tu conexión e intenta de nuevo';
    }

    /* ---------- TRANSACCIONES Y SALDO ---------- */
    function saldo() {
        return api.get('/transacciones/saldo').then(function (r) {
            return Number(r.saldo);
        });
    }

    function resumenMes() {
        return api.get('/transacciones/resumen-mes');
    }

    function movimientos(limite) {
        return api.get('/transacciones?limite=' + limite).then(function (filas) {
            return filas.map(function (fila) {
                return { tipo: fila.tipo === 'ingreso' ? 'ingresar' : 'sacar', cantidad: Number(fila.monto) };
            });
        });
    }

    function registrarMovimiento(tipo, monto) {
        return api.post('/transacciones', { tipo: tipo, monto: monto });
    }

    /* ---------- CATEGORIAS ---------- */
    function categorias() {
        return api.get('/categorias').then(function (filas) {
            return filas.map(function (f) {
                return {
                    id: f.id, nombre: f.nombre, icono: f.icono, color: f.color,
                    monto: Number(f.monto_objetivo), frecuencia: f.frecuencia,
                    fecha: f.dia_pago, abonado: Number(f.abonado)
                };
            });
        });
    }

    function crearCategoria(c) {
        return api.post('/categorias', c);
    }

    function abonarCategoria(id, monto) {
        return api.post('/transacciones', { tipo: 'abono_categoria', monto: monto, categoria_id: id });
    }

    /* "Reiniciar" empieza un ciclo nuevo: los abonos anteriores dejan de contarse */
    function reiniciarCategoria(id) {
        return api.post('/categorias/' + id + '/reiniciar');
    }

    /* ---------- METAS ---------- */
    function metas() {
        return api.get('/metas').then(function (filas) {
            return filas.map(function (f) {
                return {
                    id: f.id, nombre: f.nombre, icono: f.icono, color: f.color,
                    monto: Number(f.monto_meta), fecha: f.fecha_estimada,
                    ahorrado: Number(f.ahorrado), movimientos: []
                };
            });
        });
    }

    function crearMeta(m) {
        return api.post('/metas', m);
    }

    function movimientosMeta(id) {
        return api.get('/metas/' + id + '/movimientos').then(function (filas) {
            return filas.map(function (fila) {
                return { tipo: fila.tipo === 'aporte_meta' ? 'ingresar' : 'retirar', cantidad: Number(fila.monto) };
            });
        });
    }

    function moverMeta(id, tipo, monto) {
        return api.post('/transacciones', { tipo: tipo, monto: monto, meta_id: id });
    }

    /* Eliminar = el servidor devuelve lo ahorrado al saldo y marca la meta como inactiva.
       El segundo parametro se conserva para no cambiar los archivos que la llaman */
    function eliminarMeta(id, ahorrado) {
        return api.eliminar('/metas/' + id);
    }

    return {
        textoError: textoError, usuarioId: usuarioId,
        saldo: saldo, resumenMes: resumenMes, movimientos: movimientos, registrarMovimiento: registrarMovimiento,
        categorias: categorias, crearCategoria: crearCategoria, abonarCategoria: abonarCategoria, reiniciarCategoria: reiniciarCategoria,
        metas: metas, crearMeta: crearMeta, movimientosMeta: movimientosMeta, moverMeta: moverMeta, eliminarMeta: eliminarMeta
    };
})();