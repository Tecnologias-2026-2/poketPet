/* Logica de CATEGORIAS. Se carga despues de scripts.js y usa sus funciones
   leerNumero() y formatear(). Los datos se guardan en sessionStorage,
   igual que el saldo y los movimientos del resto de la app. */
(function () {
    var COLORES = {
        verde:   ['rgb(22, 163, 74)',  'rgb(220, 245, 232)'],
        azul:    ['rgb(59, 130, 246)', 'rgb(219, 234, 254)'],
        morado:  ['rgb(168, 85, 247)', 'rgb(243, 232, 255)'],
        naranja: ['rgb(245, 158, 11)', 'rgb(254, 243, 199)'],
        rojo:    ['rgb(239, 68, 68)',  'rgb(254, 226, 226)']
    };
    var ICONOS = {
        'Arriendo': '🏠', 'Mercado': '🛒', 'Servicios públicos': '💡', 'Transporte': '🚌',
        'Entretenimiento': '🎬', 'Educación': '🎓', 'Niños': '🧸', 'Deuda': '💳',
        'Créditos': '🏦', 'Salud': '🩺', 'Ropa': '👕', 'Telecomunicaciones': '📱',
        'Seguros': '🛡️', 'Mascotas': '🐾', 'Hogar': '🛋️', 'Gasolina': '⛽',
        'Gimnasio': '🏋️', 'Suscripciones': '📺', 'Otro': '✨'
    };
    var DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    var pantallaCarga = document.querySelector('.cargando');

    /* ---------- FUNCIONES DE AYUDA ---------- */
    function leerCategorias() {
        return JSON.parse(sessionStorage.getItem('categorias')) || [];
    }

    function guardarCategorias(lista) {
        sessionStorage.setItem('categorias', JSON.stringify(lista));
    }

    function escapar(texto) {
        var caja = document.createElement('div');
        caja.textContent = texto;
        return caja.innerHTML;
    }

    function soloNumeros(campo) {
        campo.value = campo.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    }

    function fechaDelMes(anio, mes, dia) {
        var ultimo = new Date(anio, mes + 1, 0).getDate();
        return new Date(anio, mes, Math.min(dia, ultimo));
    }

    function diasRestantes(categoria) {
        var hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (categoria.frecuencia === 'semanal') {
            return (categoria.fecha - hoy.getDay() + 7) % 7;
        }
        var objetivo = fechaDelMes(hoy.getFullYear(), hoy.getMonth(), categoria.fecha);
        if (objetivo < hoy) {
            objetivo = fechaDelMes(hoy.getFullYear(), hoy.getMonth() + 1, categoria.fecha);
        }
        return Math.round((objetivo - hoy) / 86400000);
    }

    function textoDias(dias) {
        if (dias === 0) { return 'Vence hoy'; }
        if (dias === 1) { return 'Falta 1 día'; }
        return 'Faltan ' + dias + ' días';
    }

    function textoFecha(categoria) {
        if (categoria.frecuencia === 'mensual') {
            return 'Día ' + categoria.fecha + ' del mes';
        }
        return 'Cada ' + DIAS_SEMANA[categoria.fecha].toLowerCase();
    }

    /* ---------- PAGINA: LISTA DE CATEGORIAS ---------- */
    var cuadricula = document.querySelector('#cuadricula');
    var categoriaActiva = null;

    function pintarLista() {
        var lista = leerCategorias();
        var totalAbonado = 0;
        var totalMeta = 0;
        var urgente = null;

        cuadricula.innerHTML = '';
        if (lista.length === 0) {
            cuadricula.innerHTML = '<p class="sin-categorias">Aún no tienes categorías. Crea la primera con el botón "Crear nueva categoría".</p>';
        }

        lista.forEach(function (c) {
            var restante = Math.max(c.monto - c.abonado, 0);
            var porcentaje = Math.min(Math.round(c.abonado * 100 / c.monto), 100);
            var dias = diasRestantes(c);
            var colores = COLORES[c.color] || COLORES.verde;
            var textoPie = restante === 0 ? 'Pago completo ✅' : textoDias(dias) + ' · ' + textoFecha(c);
            var claseDias = (restante > 0 && dias <= 3) ? 'cat-dias urgente' : 'cat-dias';
            var tarjeta = document.createElement('article');

            totalAbonado += c.abonado;
            totalMeta += c.monto;
            if (restante > 0 && dias <= 3 && (urgente === null || dias < urgente.dias)) {
                urgente = { nombre: c.nombre, dias: dias };
            }

            tarjeta.className = 'tarjeta-categoria';
            tarjeta.style.setProperty('--color', colores[0]);
            tarjeta.style.setProperty('--suave', colores[1]);
            tarjeta.innerHTML =
                '<div class="cat-cabecera">' +
                    '<span class="cat-icono">' + c.icono + '</span>' +
                    '<h3>' + escapar(c.nombre) + '</h3>' +
                    '<span class="cat-etiqueta">' + (c.frecuencia === 'mensual' ? 'Mensual' : 'Semanal') + '</span>' +
                '</div>' +
                '<div class="cat-montos">' +
                    '<div><small>Apartado</small><b>' + formatear(c.abonado) + '</b></div>' +
                    '<div><small>Meta</small><span>' + formatear(c.monto) + '</span></div>' +
                '</div>' +
                '<div class="barra"><div class="barra-relleno" style="width: ' + porcentaje + '%;"></div></div>' +
                '<div class="cat-pie"><span>' + porcentaje + '% completado</span><span>Faltan ' + formatear(restante) + '</span></div>' +
                '<p class="' + claseDias + '">📅 ' + textoPie + '</p>' +
                '<button class="boton-abonar" type="button" data-accion="abonar" data-id="' + c.id + '">Abonar a esta categoría</button>' +
                '<button class="boton-reiniciar" type="button" data-accion="reiniciar" data-id="' + c.id + '">Reiniciar</button>';
            cuadricula.appendChild(tarjeta);
        });

        document.querySelector('#resumen-activas').textContent = lista.length;
        document.querySelector('#resumen-abonado').textContent = formatear(totalAbonado);
        document.querySelector('#resumen-meta').textContent = formatear(totalMeta);
        document.querySelector('#resumen-progreso').textContent = (totalMeta === 0 ? 0 : Math.round(totalAbonado * 100 / totalMeta)) + '%';

        var nota = document.querySelector('#nota-estado');
        if (urgente) {
            nota.innerHTML = '<b>¡Atención!</b>' + escapar(urgente.nombre) + ': ' + textoDias(urgente.dias).toLowerCase() + ' y aún te falta apartar dinero.';
        } else {
            nota.innerHTML = '<b>¡Vas al día con tus pagos!</b>Te avisaremos cuando se acerque una fecha de pago.';
        }
    }

    /* ---------- VENTANA DE ABONO ---------- */
    var ventanaAbono = document.querySelector('#ventana-abono');
    var campoAbono = document.querySelector('#abono-monto');
    var mensajeAbono = document.querySelector('#abono-mensaje');
    var botonAbono = document.querySelector('#abono-confirmar');

    function validarAbono() {
        var cantidad = Number(campoAbono.value);
        var saldo = leerNumero('saldo');
        var restante = categoriaActiva.monto - categoriaActiva.abonado;

        mensajeAbono.className = 'mensaje-monto';
        botonAbono.classList.remove('listo');
        botonAbono.disabled = true;

        if (campoAbono.value === '') {
            mensajeAbono.textContent = '';
            return;
        }
        if (cantidad <= 0) {
            mensajeAbono.textContent = 'La cantidad debe ser mayor a $0';
            mensajeAbono.classList.add('error');
        } else if (cantidad > saldo) {
            mensajeAbono.textContent = 'No tienes saldo suficiente (' + formatear(saldo) + ')';
            mensajeAbono.classList.add('error');
        } else if (cantidad > restante) {
            mensajeAbono.textContent = 'Solo te faltan ' + formatear(restante) + ' en esta categoría';
            mensajeAbono.classList.add('error');
        } else {
            mensajeAbono.textContent = 'Vas a abonar ' + formatear(cantidad);
            botonAbono.classList.add('listo');
            botonAbono.disabled = false;
        }
    }

    function cerrarAbono() {
        ventanaAbono.classList.remove('activo');
        categoriaActiva = null;
    }

    function confirmarAbono() {
        var cantidad = Number(campoAbono.value);
        var lista = leerCategorias();
        var movimientos = JSON.parse(sessionStorage.getItem('movimientos')) || [];

        lista.forEach(function (c) {
            if (c.id === categoriaActiva.id) {
                c.abonado += cantidad;
            }
        });
        guardarCategorias(lista);
        sessionStorage.setItem('saldo', leerNumero('saldo') - cantidad);
        sessionStorage.setItem('retirado', leerNumero('retirado') + cantidad);
        movimientos.unshift({ tipo: 'sacar', cantidad: cantidad });
        sessionStorage.setItem('movimientos', JSON.stringify(movimientos));

        guardarEnBD('abonos_categoria', { categoria_id: categoriaActiva.id, cantidad: cantidad });
        actualizarEnBD('categorias', categoriaActiva.id, { abonado: categoriaActiva.abonado + cantidad });
        guardarEnBD('movimientos', { tipo: 'abono_categoria', cantidad: cantidad, saldo_resultante: leerNumero('saldo') });

        cerrarAbono();
        pintarLista();
    }

    if (cuadricula) {
        cuadricula.addEventListener('click', function (evento) {
            var boton = evento.target.closest('button');
            if (!boton) { return; }
            var id = Number(boton.dataset.id);
            var lista = leerCategorias();

            if (boton.dataset.accion === 'abonar') {
                lista.forEach(function (c) {
                    if (c.id === id) { categoriaActiva = c; }
                });
                document.querySelector('#abono-titulo').textContent = 'Abonar a ' + categoriaActiva.nombre;
                document.querySelector('#abono-ayuda').textContent = 'Saldo disponible: ' + formatear(leerNumero('saldo')) +
                    ' · Faltan ' + formatear(Math.max(categoriaActiva.monto - categoriaActiva.abonado, 0));
                campoAbono.value = '';
                validarAbono();
                ventanaAbono.classList.add('activo');
                campoAbono.focus();
            }
            if (boton.dataset.accion === 'reiniciar') {
                if (confirm('¿Reiniciar esta categoría? Empezará de nuevo desde $0.')) {
                    lista.forEach(function (c) {
                        if (c.id === id) { c.abonado = 0; }
                    });
                    guardarCategorias(lista);
                    actualizarEnBD('categorias', id, { abonado: 0 });
                    pintarLista();
                }
            }
        });

        campoAbono.addEventListener('input', function () {
            soloNumeros(campoAbono);
            validarAbono();
        });
        botonAbono.addEventListener('click', function () {
            if (!botonAbono.disabled) { confirmarAbono(); }
        });
        document.querySelector('#abono-cancelar').addEventListener('click', cerrarAbono);
        ventanaAbono.addEventListener('click', function (evento) {
            if (evento.target === ventanaAbono) { cerrarAbono(); }
        });

        pintarLista();
    }

    /* ---------- PAGINA: CREAR CATEGORIA ---------- */
    var contenedorOpciones = document.querySelector('#opciones');

    if (contenedorOpciones) {
        var nombreElegido = '';
        var frecuencia = 'mensual';
        var colorElegido = 'verde';
        var campoOtro = document.querySelector('#nombre-otro');
        var campoMonto = document.querySelector('#monto-pago');
        var selectorFecha = document.querySelector('#fecha-pago');
        var botonCrear = document.querySelector('#boton-crear');

        function nombreFinal() {
            return nombreElegido === 'Otro' ? campoOtro.value.trim() : nombreElegido;
        }

        function validarCrear() {
            var listo = nombreFinal() !== '' && Number(campoMonto.value) > 0 && selectorFecha.value !== '';
            botonCrear.classList.toggle('listo', listo);
            botonCrear.disabled = !listo;
        }

        function llenarFechas() {
            var opciones = '<option value="">Elige el día</option>';
            var i;
            if (frecuencia === 'mensual') {
                for (i = 1; i <= 31; i++) {
                    opciones += '<option value="' + i + '">Día ' + i + ' de cada mes</option>';
                }
                document.querySelector('#etiqueta-fecha').textContent = 'Día del mes de pago';
            } else {
                for (i = 0; i < 7; i++) {
                    opciones += '<option value="' + i + '">Cada ' + DIAS_SEMANA[i].toLowerCase() + '</option>';
                }
                document.querySelector('#etiqueta-fecha').textContent = 'Día de la semana de pago';
            }
            selectorFecha.innerHTML = opciones;
            validarCrear();
        }

        Object.keys(ICONOS).forEach(function (nombre) {
            var boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'opcion';
            boton.dataset.nombre = nombre;
            boton.innerHTML = '<span>' + ICONOS[nombre] + '</span>' + nombre;
            contenedorOpciones.appendChild(boton);
        });

        contenedorOpciones.addEventListener('click', function (evento) {
            var boton = evento.target.closest('.opcion');
            if (!boton) { return; }
            nombreElegido = boton.dataset.nombre;
            contenedorOpciones.querySelectorAll('.opcion').forEach(function (opcion) {
                opcion.classList.toggle('activa', opcion === boton);
            });
            campoOtro.classList.toggle('oculto', nombreElegido !== 'Otro');
            validarCrear();
        });

        document.querySelectorAll('.pestana').forEach(function (pestana) {
            pestana.addEventListener('click', function () {
                frecuencia = pestana.dataset.frecuencia;
                document.querySelectorAll('.pestana').forEach(function (otra) {
                    otra.classList.toggle('activa', otra === pestana);
                });
                llenarFechas();
            });
        });

        document.querySelectorAll('.color-opcion').forEach(function (boton) {
            boton.addEventListener('click', function () {
                colorElegido = boton.dataset.color;
                document.querySelectorAll('.color-opcion').forEach(function (otro) {
                    otro.classList.toggle('activo', otro === boton);
                });
            });
        });

        campoMonto.addEventListener('input', function () {
            soloNumeros(campoMonto);
            validarCrear();
        });
        campoOtro.addEventListener('input', validarCrear);
        selectorFecha.addEventListener('change', validarCrear);

        botonCrear.addEventListener('click', function () {
            if (botonCrear.disabled) { return; }
            var lista = leerCategorias();
            var nueva = {
                id: Date.now(),
                nombre: nombreFinal(),
                icono: ICONOS[nombreElegido],
                monto: Number(campoMonto.value),
                frecuencia: frecuencia,
                fecha: Number(selectorFecha.value),
                color: colorElegido,
                abonado: 0
            };
            lista.push(nueva);
            guardarCategorias(lista);
            guardarEnBD('categorias', {
                id: nueva.id,
                nombre: nueva.nombre,
                monto: nueva.monto,
                frecuencia: nueva.frecuencia,
                dia_de_pago: nueva.fecha,
                color: nueva.color,
                abonado: 0
            });

            pantallaCarga.classList.add('activo');
            setTimeout(function () {
                window.location.href = 'categorias.html';
            }, 2000);
        });

        llenarFechas();
    }
})();
