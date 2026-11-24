var cargando = document.querySelector('.cargando');
var formularios = document.querySelectorAll('form');

/* ---------- FUNCIONES DE AYUDA (saldo guardado en la sesion) ---------- */
function leerNumero(clave) {
    return Number(sessionStorage.getItem(clave)) || 0;
}

function formatear(valor) {
    return '$' + valor.toLocaleString('es-CO');
}

/* ---------- FORMULARIOS (login y registro) ---------- */
formularios.forEach(function (formulario) {
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        cargando.classList.add('activo');
        setTimeout(function () {
            window.location.href = formulario.dataset.destino;
        }, 2000);
    });
});
/* enlaces con pantalla de carga*/
var enlacesCarga = document.querySelectorAll('.enlace-carga');

enlacesCarga.forEach(function (enlace) {
    enlace.addEventListener('click', function (evento) {
        evento.preventDefault();
        cargando.classList.add('activo');
        setTimeout(function () {
            window.location.href = enlace.dataset.destino;
        }, 2000);
    });
});

/* ---------- VENTANA DE PERFIL ---------- */
var botonPerfil = document.querySelector('#boton-perfil');
var cerrarPerfil = document.querySelector('#cerrar-perfil');
var fondoVentana = document.querySelector('.fondo-ventana');

if (botonPerfil) {
    botonPerfil.addEventListener('click', function () {
        fondoVentana.classList.add('activo');
    });
    cerrarPerfil.addEventListener('click', function () {
        fondoVentana.classList.remove('activo');
    });
    fondoVentana.addEventListener('click', function (evento) {
        if (evento.target === fondoVentana) {
            fondoVentana.classList.remove('activo');
        }
    });
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape') {
            fondoVentana.classList.remove('activo');
        }
    });
}

/* ---------- MENU: SCROLL SUAVE Y OPCION ACTIVA ---------- */
var enlaceInicio = document.querySelector('#enlace-inicio');
var enlaceEducacion = document.querySelector('#enlace-educacion');
var seccionEducacion = document.querySelector('#educacion');

if (enlaceInicio) {
    enlaceInicio.addEventListener('click', function (evento) {
        evento.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        var posicion = seccionEducacion.getBoundingClientRect().top;
        if (posicion < 200) {
            enlaceEducacion.classList.add('activo');
            enlaceInicio.classList.remove('activo');
        } else {
            enlaceInicio.classList.add('activo');
            enlaceEducacion.classList.remove('activo');
        }
    });
}

/* ---------- TARJETAS DE EDUCACION (+ y -) ---------- */
var botonesTema = document.querySelectorAll('.tema-mas');

botonesTema.forEach(function (boton) {
    boton.addEventListener('click', function () {
        var tema = boton.parentElement;
        tema.classList.toggle('abierto');
        if (tema.classList.contains('abierto')) {
            boton.textContent = '-';
        } else {
            boton.textContent = '+';
        }
    });
});

/* ---------- MAIN: MOSTRAR SALDO GUARDADO ---------- */
var saldoValor = document.querySelector('#saldo-valor');

if (saldoValor) {
    saldoValor.textContent = formatear(leerNumero('saldo'));
    document.querySelector('#ingresos-valor').textContent = formatear(leerNumero('ingresado'));
    document.querySelector('#gastos-valor').textContent = formatear(leerNumero('retirado'));
}

/* ---------- INGRESAR Y SACAR DINERO ---------- */
var pestanas = document.querySelectorAll('.pestana');
var montosRapidos = document.querySelectorAll('.monto');
var campoCantidad = document.querySelector('#cantidad');
var mensajeMonto = document.querySelector('#mensaje-monto');
var botonConfirmar = document.querySelector('#boton-confirmar');
var modo = 'ingresar';

function mostrarCifras() {
    document.querySelector('#cifra-saldo').textContent = formatear(leerNumero('saldo'));
    document.querySelector('#cifra-ingresado').textContent = formatear(leerNumero('ingresado'));
}

function mostrarMovimientos() {
    var lista = document.querySelector('#lista-movimientos');
    var movimientos = JSON.parse(sessionStorage.getItem('movimientos')) || [];

    lista.innerHTML = '';
    if (movimientos.length === 0) {
        lista.innerHTML = '<li class="sin-movimientos">Aún no tienes movimientos</li>';
        return;
    }
    movimientos.forEach(function (movimiento) {
        var fila = document.createElement('li');
        fila.className = 'fila-movimiento';
        if (movimiento.tipo === 'ingresar') {
            fila.innerHTML = '<span>💰 Ingreso</span><b class="positivo">+' + formatear(movimiento.cantidad) + '</b>';
        } else {
            fila.innerHTML = '<span>💸 Retiro</span><b class="negativo">-' + formatear(movimiento.cantidad) + '</b>';
        }
        lista.appendChild(fila);
    });
}

function validar() {
    var cantidad = Number(campoCantidad.value);
    var saldo = leerNumero('saldo');

    montosRapidos.forEach(function (monto) {
        monto.classList.toggle('activo', monto.dataset.valor === campoCantidad.value);
    });

    mensajeMonto.className = 'mensaje-monto';
    botonConfirmar.classList.remove('listo');
    botonConfirmar.disabled = true;

    if (campoCantidad.value === '') {
        mensajeMonto.textContent = '';
        return;
    }
    if (cantidad <= 0) {
        mensajeMonto.textContent = 'La cantidad debe ser mayor a $0';
        mensajeMonto.classList.add('error');
        return;
    }
    if (modo === 'sacar' && cantidad > saldo) {
        mensajeMonto.textContent = 'No puedes retirar más de tu saldo (' + formatear(saldo) + ')';
        mensajeMonto.classList.add('error');
        return;
    }
    if (modo === 'ingresar') {
        mensajeMonto.textContent = 'Vas a ingresar ' + formatear(cantidad);
    } else {
        mensajeMonto.textContent = 'Vas a retirar ' + formatear(cantidad);
    }
    botonConfirmar.classList.add('listo');
    botonConfirmar.disabled = false;
}

function cambiarModo(nuevoModo) {
    modo = nuevoModo;

    pestanas.forEach(function (pestana) {
        pestana.classList.toggle('activa', pestana.dataset.modo === modo);
    });

    if (modo === 'ingresar') {
        document.querySelector('#mov-mascota').src = 'assets/mascota-festejo.png';
        document.querySelector('#mov-titulo').textContent = 'WOW!!,';
        document.querySelector('#mov-subtitulo').textContent = 'vamos por más';
        document.querySelector('#mov-pregunta').textContent = '¿Cuánto vas a ingresar?';
        botonConfirmar.textContent = 'Confirmar ingreso';
    } else {
        document.querySelector('#mov-mascota').src = 'assets/mascota_triste.png';
        document.querySelector('#mov-titulo').textContent = 'Retirar Dinero';
        document.querySelector('#mov-subtitulo').textContent = 'Gestiona tus fondos de forma segura';
        document.querySelector('#mov-pregunta').textContent = '¿Cuánto vas a sacar?';
        botonConfirmar.textContent = 'Confirmar retiro';
    }

    campoCantidad.value = '';
    validar();
}

if (campoCantidad) {
    pestanas.forEach(function (pestana) {
        pestana.addEventListener('click', function () {
            cambiarModo(pestana.dataset.modo);
        });
    });

    montosRapidos.forEach(function (monto) {
        monto.addEventListener('click', function () {
            campoCantidad.value = monto.dataset.valor;
            validar();
        });
    });

    campoCantidad.addEventListener('input', function () {
        campoCantidad.value = campoCantidad.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        validar();
    });

    botonConfirmar.addEventListener('click', function () {
        if (botonConfirmar.disabled) {
            return;
        }
        var cantidad = Number(campoCantidad.value);
        var saldo = leerNumero('saldo');
        var movimientos = JSON.parse(sessionStorage.getItem('movimientos')) || [];

        if (modo === 'ingresar') {
            sessionStorage.setItem('saldo', saldo + cantidad);
            sessionStorage.setItem('ingresado', leerNumero('ingresado') + cantidad);
        } else {
            sessionStorage.setItem('saldo', saldo - cantidad);
            sessionStorage.setItem('retirado', leerNumero('retirado') + cantidad);
        }
        movimientos.unshift({ tipo: modo, cantidad: cantidad });
        sessionStorage.setItem('movimientos', JSON.stringify(movimientos));

        cargando.classList.add('activo');
        setTimeout(function () {
            window.location.href = 'main.html';
        }, 2000);
    });

    var modoInicial = new URLSearchParams(window.location.search).get('modo');
    mostrarCifras();
    mostrarMovimientos();
    cambiarModo(modoInicial === 'sacar' ? 'sacar' : 'ingresar');
}