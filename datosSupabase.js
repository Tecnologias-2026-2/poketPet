var datosApp = (function () {
 
    function revisar(respuesta) {
        if (respuesta.error) {
            throw respuesta.error;
        }
        return respuesta.data;
    }
 
    function usuarioId() {
        return clienteSupabase.auth.getSession().then(function (r) {
            if (!r.data.session) {
                throw new Error('Sin sesión');
            }
            return r.data.session.user.id;
        });
    }
 
    /* Los errores de las reglas de la base (saldo insuficiente, maximo 4 metas...)
       llegan con codigo P0001 y ya vienen escritos para el usuario */
    function textoError(error) {
        if (error && error.code === 'P0001') {
            return error.message;
        }
        console.error('Error con Supabase:', error);
        return 'No se pudo guardar. Revisa tu conexión e intenta de nuevo';
    }
 
    /* ---------- TRANSACCIONES Y SALDO ---------- */
    function insertarTransaccion(campos) {
        return usuarioId().then(function (id) {
            campos.usuario_id = id;
            return clienteSupabase.from('transacciones').insert(campos);
        }).then(revisar);
    }
 
    function saldo() {
        return clienteSupabase.from('v_saldo').select('saldo').maybeSingle()
            .then(revisar).then(function (fila) {
                return fila ? Number(fila.saldo) : 0;
            });
    }
 
    function resumenMes() {
        var inicio = new Date();
        inicio.setDate(1);
        inicio.setHours(0, 0, 0, 0);
 
        return clienteSupabase.from('transacciones').select('tipo, monto')
            .in('tipo', ['ingreso', 'retiro', 'abono_categoria'])
            .gte('fecha', inicio.toISOString())
            .then(revisar).then(function (filas) {
                var total = { ingresos: 0, gastos: 0 };
                filas.forEach(function (fila) {
                    if (fila.tipo === 'ingreso') {
                        total.ingresos += Number(fila.monto);
                    } else {
                        total.gastos += Number(fila.monto);
                    }
                });
                return total;
            });
    }
 
    function movimientos(limite) {
        return clienteSupabase.from('transacciones').select('tipo, monto, fecha')
            .order('fecha', { ascending: false }).limit(limite)
            .then(revisar).then(function (filas) {
                return filas.map(function (fila) {
                    return { tipo: fila.tipo === 'ingreso' ? 'ingresar' : 'sacar', cantidad: Number(fila.monto) };
                });
            });
    }
 
    function registrarMovimiento(tipo, monto) {
        return insertarTransaccion({ tipo: tipo, monto: monto });
    }
 
    /* ---------- CATEGORIAS ---------- */
    function categorias() {
        return clienteSupabase.from('v_categorias_progreso').select('*').order('id')
            .then(revisar).then(function (filas) {
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
        return usuarioId().then(function (id) {
            return clienteSupabase.from('categorias').insert({
                usuario_id: id, nombre: c.nombre, icono: c.icono, color: c.color,
                monto_objetivo: c.monto, frecuencia: c.frecuencia, dia_pago: c.fecha
            });
        }).then(revisar);
    }
 
    function abonarCategoria(id, monto) {
        return insertarTransaccion({ tipo: 'abono_categoria', monto: monto, categoria_id: id });
    }
 
    /* "Reiniciar" empieza un ciclo nuevo: los abonos anteriores dejan de contarse */
    function reiniciarCategoria(id) {
        return clienteSupabase.from('categorias')
            .update({ ciclo_inicio: new Date().toISOString() }).eq('id', id)
            .then(revisar);
    }
 
    /* ---------- METAS ---------- */
    function metas() {
        return clienteSupabase.from('v_metas_progreso').select('*').order('id')
            .then(revisar).then(function (filas) {
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
        return usuarioId().then(function (id) {
            return clienteSupabase.from('metas').insert({
                usuario_id: id, nombre: m.nombre, icono: m.icono, color: m.color,
                monto_meta: m.monto, fecha_estimada: m.fecha
            });
        }).then(revisar);
    }
 
    function movimientosMeta(id) {
        return clienteSupabase.from('transacciones').select('tipo, monto, fecha')
            .eq('meta_id', id).order('fecha', { ascending: false }).limit(5)
            .then(revisar).then(function (filas) {
                return filas.map(function (fila) {
                    return { tipo: fila.tipo === 'aporte_meta' ? 'ingresar' : 'retirar', cantidad: Number(fila.monto) };
                });
            });
    }
 
    function moverMeta(id, tipo, monto) {
        return insertarTransaccion({ tipo: tipo, monto: monto, meta_id: id });
    }
 
    /* Eliminar = devolver lo ahorrado al saldo y marcar la meta como inactiva.
       No se borra la fila para que el historial de transacciones siga completo */
    function eliminarMeta(id, ahorrado) {
        var devolucion = ahorrado > 0 ?
            insertarTransaccion({ tipo: 'retiro_meta', monto: ahorrado, meta_id: id }) :
            Promise.resolve();
 
        return devolucion.then(function () {
            return clienteSupabase.from('metas').update({ activa: false }).eq('id', id);
        }).then(revisar);
    }
 
    return {
        textoError: textoError, usuarioId: usuarioId,
        saldo: saldo, resumenMes: resumenMes, movimientos: movimientos, registrarMovimiento: registrarMovimiento,
        categorias: categorias, crearCategoria: crearCategoria, abonarCategoria: abonarCategoria, reiniciarCategoria: reiniciarCategoria,
        metas: metas, crearMeta: crearMeta, movimientosMeta: movimientosMeta, moverMeta: moverMeta, eliminarMeta: eliminarMeta
    };
})();
 