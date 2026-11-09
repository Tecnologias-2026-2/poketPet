/* Logica de METAS. Se carga despues de scripts.js y usa sus funciones
   leerNumero() y formatear(). Los datos se guardan en sessionStorage
   (sin base de datos, como pide el issue). */
(function () {
    var MAX_METAS = 4;
    var MAX_NOMBRE = 25;
    var COLORES = {
        verde:   ['rgb(22, 163, 74)',  'rgb(220, 245, 232)'],
        azul:    ['rgb(59, 130, 246)', 'rgb(219, 234, 254)'],
        morado:  ['rgb(168, 85, 247)', 'rgb(243, 232, 255)'],
        naranja: ['rgb(245, 158, 11)', 'rgb(254, 243, 199)'],
        rojo:    ['rgb(239, 68, 68)',  'rgb(254, 226, 226)']
    };
    var ICONOS = ['📱', '✈️', '💻', '🏠', '🚗', '🎓', '🎮', '🎁'];
    var pantallaCarga = document.querySelector('.cargando');
    var vistas = {
        lista: document.querySelector('#vista-lista'),
        crear: document.querySelector('#vista-crear'),
        detalle: document.querySelector('#vista-detalle'),
        movimiento: document.querySelector('#vista-movimiento')
    };
    var metasActuales = [];
    var metaActual = null;
    var saldoActual = 0;
    var iconoElegido = ICONOS[0];
    var colorElegido = 'verde';
    var modo = 'ingresar';
 
    /* ---------- FUNCIONES DE AYUDA ---------- */
    function escapar(texto) {
        var caja = document.createElement('div');
        caja.textContent = texto;
        return caja.innerHTML;
    }
 
    function soloNumeros(campo) {
        campo.value = campo.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    }
 
    function dosDigitos(numero) {
        return (numero < 10 ? '0' : '') + numero;
    }
 
    function hoyISO() {
        var d = new Date();
        return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
    }
 
    function aFecha(iso) {
        var partes = iso.split('-');
        return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    }
 
    function diasHasta(iso) {
        var hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return Math.round((aFecha(iso) - hoy) / 86400000);
    }
 
    function textoDias(dias) {
        if (dias < 0) { return 'La fecha ya pasó'; }
        if (dias === 0) { return 'Es hoy'; }
        if (dias === 1) { return 'Falta 1 día'; }
        return 'Faltan ' + dias + ' días';
    }
 
    function textoFecha(iso) {
        return aFecha(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    }
 
    function porcentaje(meta) {
        return Math.min(Math.round(meta.ahorrado * 100 / meta.monto), 100);
    }
 
    function aplicarColor(elemento, nombre) {
        var colores = COLORES[nombre] || COLORES.verde;
        elemento.style.setProperty('--color', colores[0]);
        elemento.style.setProperty('--suave', colores[1]);
    }
 
    function mostrarVista(nombre) {
        Object.keys(vistas).forEach(function (clave) {
            vistas[clave].hidden = (clave !== nombre);
        });
        window.scrollTo(0, 0);
    }
 
    function buscarMeta(id) {
        var encontrada = null;
        metasActuales.forEach(function (m) {
            if (m.id === id) { encontrada = m; }
        });
        return encontrada;
    }
 
    function avisarError(error) {
        alert(datosApp.textoError(error));
    }
 
    /* ---------- VISTA 1: LISTA ---------- */
    var cuadricula = document.querySelector('#cuadricula');
 
    function pintarLista() {
        var lista = metasActuales;
        var totalAhorrado = 0;
        var totalMeta = 0;
        var cumplida = null;
 
        cuadricula.innerHTML = '';
        if (lista.length === 0) {
            cuadricula.innerHTML = '<p class="sin-categorias">Aún no tienes metas. ¡Crea la primera con el botón "Crear nueva meta"!</p>';
        }
 
        lista.forEach(function (m) {
            var pct = porcentaje(m);
            var dias = diasHasta(m.fecha);
            var completa = m.ahorrado >= m.monto;
            var textoPie = completa ? '¡Meta cumplida! 🎉' : textoDias(dias) + ' · ' + textoFecha(m.fecha);
            var tarjeta = document.createElement('article');
 
            totalAhorrado += m.ahorrado;
            totalMeta += m.monto;
            if (completa && cumplida === null) { cumplida = m.nombre; }
 
            tarjeta.className = 'tarjeta-categoria';
            aplicarColor(tarjeta, m.color);
            tarjeta.innerHTML =
                '<div class="cat-cabecera">' +
                    '<span class="cat-icono">' + escapar(m.icono || '🎯') + '</span>' +
                    '<h3>' + escapar(m.nombre) + '</h3>' +
                '</div>' +
                '<div class="cat-montos">' +
                    '<div><small>Ahorrado</small><b>' + formatear(m.ahorrado) + '</b></div>' +
                    '<div><small>Meta</small><span>' + formatear(m.monto) + '</span></div>' +
                '</div>' +
                '<div class="barra"><div class="barra-relleno" style="width: ' + pct + '%;"></div></div>' +
                '<div class="cat-pie"><span>' + pct + '% completado</span><span>Faltan ' + formatear(Math.max(m.monto - m.ahorrado, 0)) + '</span></div>' +
                '<p class="cat-dias">📅 ' + textoPie + '</p>' +
                '<button class="boton-abonar" type="button" data-id="' + m.id + '">Abonar a esta meta</button>';
            cuadricula.appendChild(tarjeta);
        });
 
        document.querySelector('#resumen-activas').textContent = lista.length;
        document.querySelector('#resumen-ahorrado').textContent = formatear(totalAhorrado);
        document.querySelector('#resumen-meta').textContent = formatear(totalMeta);
        document.querySelector('#resumen-progreso').textContent = (totalMeta === 0 ? 0 : Math.round(totalAhorrado * 100 / totalMeta)) + '%';
 
        /* el boton "+" desaparece al llegar al maximo de metas */
        var llegoAlMaximo = lista.length >= MAX_METAS;
        document.querySelector('#boton-nueva-meta').hidden = llegoAlMaximo;
        document.querySelector('#aviso-maximo').hidden = !llegoAlMaximo;
 
        document.querySelector('#nota-estado').innerHTML = cumplida ?
            '<b>¡Meta cumplida!</b>Lograste "' + escapar(cumplida) + '". ¡Felicidades! 🎉' :
            '<b>¡Sigue así!</b>Estás muy cerca de tu meta 🌟';
    }
 
    function abrirLista() {
        mostrarVista('lista');
        return datosApp.metas().then(function (lista) {
            metasActuales = lista;
            pintarLista();
        }).catch(function (error) {
            cuadricula.innerHTML = '<p class="sin-categorias">' + escapar(datosApp.textoError(error)) + '</p>';
        });
    }
 
    /* ---------- VISTA 2: CREAR ---------- */
    var campoNombre = document.querySelector('#nombre-meta');
    var campoMonto = document.querySelector('#monto-meta');
    var campoFecha = document.querySelector('#fecha-meta');
    var mensajeCrear = document.querySelector('#mensaje-crear');
    var botonCrear = document.querySelector('#boton-crear-meta');
    var contenedorIconos = document.querySelector('#iconos-meta');
 
    function validarCrear() {
        var nombre = campoNombre.value.trim();
        var monto = Number(campoMonto.value);
        var error = '';
 
        document.querySelector('#contador-nombre').textContent = campoNombre.value.length + '/' + MAX_NOMBRE;
        if (campoMonto.value !== '' && monto <= 0) {
            error = 'El monto de la meta debe ser mayor a $0';
        } else if (campoFecha.value !== '' && campoFecha.value < hoyISO()) {
            error = 'La fecha estimada debe ser hoy o una fecha futura';
        }
        mensajeCrear.textContent = error;
        mensajeCrear.className = 'mensaje-monto' + (error ? ' error' : '');
 
        var listo = nombre !== '' && monto > 0 && campoFecha.value !== '' && error === '';
        botonCrear.classList.toggle('listo', listo);
        botonCrear.disabled = !listo;
    }
 
    function marcarIcono() {
        contenedorIconos.querySelectorAll('.opcion').forEach(function (boton) {
            boton.classList.toggle('activa', boton.dataset.icono === iconoElegido);
        });
    }
 
    function marcarColor() {
        document.querySelectorAll('#colores-meta .color-opcion').forEach(function (boton) {
            boton.classList.toggle('activo', boton.dataset.color === colorElegido);
        });
    }
 
    function abrirCrear() {
        campoNombre.value = '';
        campoMonto.value = '';
        campoFecha.value = '';
        campoFecha.min = hoyISO();
        iconoElegido = ICONOS[0];
        colorElegido = 'verde';
        marcarIcono();
        marcarColor();
        validarCrear();
        mostrarVista('crear');
    }
 
    ICONOS.forEach(function (icono) {
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'opcion';
        boton.dataset.icono = icono;
        boton.innerHTML = '<span>' + icono + '</span>';
        contenedorIconos.appendChild(boton);
    });
 
    contenedorIconos.addEventListener('click', function (evento) {
        var boton = evento.target.closest('.opcion');
        if (!boton) { return; }
        iconoElegido = boton.dataset.icono;
        marcarIcono();
    });
 
    document.querySelectorAll('#colores-meta .color-opcion').forEach(function (boton) {
        boton.addEventListener('click', function () {
            colorElegido = boton.dataset.color;
            marcarColor();
        });
    });
 
    campoNombre.addEventListener('input', validarCrear);
    campoFecha.addEventListener('input', validarCrear);
    campoMonto.addEventListener('input', function () {
        soloNumeros(campoMonto);
        validarCrear();
    });
 
    botonCrear.addEventListener('click', function () {
        if (botonCrear.disabled || metasActuales.length >= MAX_METAS) { return; }
        botonCrear.disabled = true;
        pantallaCarga.classList.add('activo');
 
        datosApp.crearMeta({
            nombre: campoNombre.value.trim(),
            icono: iconoElegido,
            color: colorElegido,
            monto: Number(campoMonto.value),
            fecha: campoFecha.value
        }).then(function () {
            return abrirLista();
        }).then(function () {
            pantallaCarga.classList.remove('activo');
        }).catch(function (error) {
            pantallaCarga.classList.remove('activo');
            mensajeCrear.textContent = datosApp.textoError(error);
            mensajeCrear.className = 'mensaje-monto error';
        });
    });
 
    /* ---------- VISTA 3: DETALLE ---------- */
    function pintarDetalle() {
        var m = metaActual;
        var pct = porcentaje(m);
        var dias = diasHasta(m.fecha);
        var lista = document.querySelector('#detalle-movimientos');
 
        aplicarColor(vistas.detalle, m.color);
        document.querySelector('#detalle-titulo').textContent = (m.icono || '🎯') + ' ' + m.nombre;
        document.querySelector('#detalle-ahorrado').textContent = formatear(m.ahorrado);
        document.querySelector('#detalle-de').textContent = 'de ' + formatear(m.monto);
        document.querySelector('#detalle-dias').textContent = m.ahorrado >= m.monto ? '¡Meta cumplida!' : textoDias(dias);
        document.querySelector('#detalle-porcentaje').textContent = pct + '%';
        document.querySelector('#detalle-circulo').style.setProperty('--pct', pct);
        document.querySelector('#detalle-barra').style.width = pct + '%';
        document.querySelector('#detalle-ahorrado-barra').textContent = formatear(m.ahorrado) + ' ahorrados';
        document.querySelector('#detalle-faltan').textContent = 'Faltan ' + formatear(Math.max(m.monto - m.ahorrado, 0));
        document.querySelector('#detalle-monto-meta').textContent = formatear(m.monto);
        document.querySelector('#detalle-fecha').textContent = textoFecha(m.fecha);
 
        lista.innerHTML = '';
        if (m.movimientos.length === 0) {
            lista.innerHTML = '<li class="sin-movimientos">Aún no tienes movimientos en esta meta</li>';
        }
        m.movimientos.forEach(function (mov) {
            var fila = document.createElement('li');
            fila.className = 'fila-movimiento';
            if (mov.tipo === 'ingresar') {
                fila.innerHTML = '<span>💰 Aporte</span><b class="positivo">+' + formatear(mov.cantidad) + '</b>';
            } else {
                fila.innerHTML = '<span>💸 Retiro</span><b class="negativo">-' + formatear(mov.cantidad) + '</b>';
            }
            lista.appendChild(fila);
        });
    }
 
    function abrirDetalle() {
        return datosApp.movimientosMeta(metaActual.id).then(function (movimientos) {
            metaActual.movimientos = movimientos;
            pintarDetalle();
            mostrarVista('detalle');
        });
    }
 
    cuadricula.addEventListener('click', function (evento) {
        var boton = evento.target.closest('.boton-abonar');
        if (!boton) { return; }
        metaActual = buscarMeta(Number(boton.dataset.id));
        abrirDetalle().catch(avisarError);
    });
 
    document.querySelector('#detalle-eliminar').addEventListener('click', function () {
        var mensaje = '¿Eliminar la meta "' + metaActual.nombre + '"?';
        if (metaActual.ahorrado > 0) {
            mensaje += ' Los ' + formatear(metaActual.ahorrado) + ' ahorrados volverán a tu saldo principal.';
        }
        if (!confirm(mensaje)) { return; }
        datosApp.eliminarMeta(metaActual.id, metaActual.ahorrado).then(function () {
            metaActual = null;
            return abrirLista();
        }).catch(avisarError);
    });
 
    /* ---------- VISTA 4: INGRESAR Y RETIRAR ---------- */
    var campoMov = document.querySelector('#mov-cantidad');
    var mensajeMov = document.querySelector('#mov-mensaje');
    var botonMov = document.querySelector('#mov-confirmar');
    var pestanasMov = document.querySelectorAll('#vista-movimiento .pestana');
    var montosMov = document.querySelectorAll('#vista-movimiento .monto');
 
    function mensajeDeMov(texto, esError) {
        mensajeMov.textContent = texto;
        mensajeMov.className = 'mensaje-monto' + (esError ? ' error' : '');
    }
 
    function validarMov() {
        var cantidad = Number(campoMov.value);
        var error = '';
        var texto = '';
 
        montosMov.forEach(function (monto) {
            monto.classList.toggle('activo', monto.dataset.valor === campoMov.value);
        });
 
        if (campoMov.value !== '') {
            if (cantidad <= 0) {
                error = 'La cantidad debe ser mayor a $0';
            } else if (modo === 'ingresar' && cantidad > saldoActual) {
                error = 'No puedes ingresar más de tu saldo principal (' + formatear(saldoActual) + ')';
            } else if (modo === 'retirar' && cantidad > metaActual.ahorrado) {
                error = 'No puedes retirar más de lo que hay en la meta (' + formatear(metaActual.ahorrado) + ')';
            } else {
                texto = (modo === 'ingresar' ? 'Vas a ingresar ' : 'Vas a retirar ') + formatear(cantidad);
            }
        }
        mensajeDeMov(error || texto, error !== '');
 
        var listo = campoMov.value !== '' && error === '';
        botonMov.classList.toggle('listo', listo);
        botonMov.disabled = !listo;
    }
 
    function abrirMovimiento(nuevoModo) {
        modo = nuevoModo;
        datosApp.saldo().then(function (saldo) {
            saldoActual = saldo;
            pestanasMov.forEach(function (pestana) {
                pestana.classList.toggle('activa', pestana.dataset.modo === modo);
            });
            document.querySelector('#mov-titulo').textContent = (modo === 'ingresar' ? 'Ingresar a ' : 'Retirar de ') + metaActual.nombre;
            document.querySelector('#mov-pregunta').textContent = modo === 'ingresar' ? '¿Cuánto vas a ingresar?' : '¿Cuánto vas a retirar?';
            document.querySelector('#mov-saldo').textContent = formatear(saldoActual);
            document.querySelector('#mov-ahorrado').textContent = formatear(metaActual.ahorrado);
            botonMov.textContent = modo === 'ingresar' ? 'Confirmar ingreso' : 'Confirmar retiro';
            campoMov.value = '';
            validarMov();
            mostrarVista('movimiento');
        }).catch(avisarError);
    }
 
    pestanasMov.forEach(function (pestana) {
        pestana.addEventListener('click', function () {
            abrirMovimiento(pestana.dataset.modo);
        });
    });
 
    montosMov.forEach(function (monto) {
        monto.addEventListener('click', function () {
            campoMov.value = monto.dataset.valor;
            validarMov();
        });
    });
 
    campoMov.addEventListener('input', function () {
        soloNumeros(campoMov);
        validarMov();
    });
 
    botonMov.addEventListener('click', function () {
        if (botonMov.disabled) { return; }
        var tipo = modo === 'ingresar' ? 'aporte_meta' : 'retiro_meta';
        var idMeta = metaActual.id;
 
        botonMov.disabled = true;
        pantallaCarga.classList.add('activo');
        datosApp.moverMeta(idMeta, tipo, Number(campoMov.value)).then(function () {
            return datosApp.metas();
        }).then(function (lista) {
            metasActuales = lista;
            metaActual = buscarMeta(idMeta);
            return abrirDetalle();
        }).then(function () {
            pantallaCarga.classList.remove('activo');
        }).catch(function (error) {
            pantallaCarga.classList.remove('activo');
            mensajeDeMov(datosApp.textoError(error), true);
        });
    });
 
    /* ---------- BOTONES DE NAVEGACION DENTRO DE LA PAGINA ---------- */
    document.querySelector('#boton-nueva-meta').addEventListener('click', abrirCrear);
    document.querySelector('#crear-volver').addEventListener('click', abrirLista);
    document.querySelector('#crear-cancelar').addEventListener('click', abrirLista);
    document.querySelector('#detalle-volver').addEventListener('click', abrirLista);
    document.querySelector('#detalle-ingresar').addEventListener('click', function () { abrirMovimiento('ingresar'); });
    document.querySelector('#detalle-retirar').addEventListener('click', function () { abrirMovimiento('retirar'); });
    document.querySelector('#mov-volver').addEventListener('click', function () {
        pintarDetalle();
        mostrarVista('detalle');
    });
    document.querySelector('#enlace-metas').addEventListener('click', function (evento) {
        evento.preventDefault();
        abrirLista();
    });
 
    cuadricula.innerHTML = '<p class="sin-categorias">Cargando tus metas...</p>';
    abrirLista();
})();
 