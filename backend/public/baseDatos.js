/* SIMULACION DE BASE DE DATOS
   Cada vez que la app "guarda" algo, se imprime en la consola del navegador
   (F12 > Console) como si fuera una consulta a una base de datos real.
   Las tablas simuladas viven en sessionStorage; escribe verBD() en la consola
   para ver todas.

   IMPORTANTE: cargar este archivo ANTES de scripts.js en cada pagina. */

/* Cambia a true solo si el profesor necesita ver las contraseñas reales
   en la consola. En una base de datos real NUNCA se guardan en texto claro. */
var MOSTRAR_CLAVES = false;
var CAMPOS_SECRETOS = ['clave', 'clave_nueva'];

/* ---------- FUNCIONES INTERNAS ---------- */
function leerTablaBD(tabla) {
    var bd = JSON.parse(sessionStorage.getItem('bd_simulada')) || {};
    return bd[tabla] || [];
}

function escribirTablaBD(tabla, filas) {
    var bd = JSON.parse(sessionStorage.getItem('bd_simulada')) || {};
    bd[tabla] = filas;
    sessionStorage.setItem('bd_simulada', JSON.stringify(bd));
}

function enmascararBD(datos) {
    var copia = {};
    Object.keys(datos).forEach(function (campo) {
        if (CAMPOS_SECRETOS.indexOf(campo) !== -1) {
            copia[campo] = '••••••••';
        } else {
            copia[campo] = datos[campo];
        }
    });
    return copia;
}

function fechaAhoraBD() {
    var d = new Date();
    function dos(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate()) + ' ' +
        dos(d.getHours()) + ':' + dos(d.getMinutes()) + ':' + dos(d.getSeconds());
}

function coincideBD(fila, donde) {
    if (typeof donde !== 'object') {
        return fila.id === donde;
    }
    return Object.keys(donde).every(function (campo) {
        return fila[campo] === donde[campo];
    });
}

function imprimirBD(operacion, tabla, contenido) {
    console.log('%c[BD simulada] ' + operacion + ' en "' + tabla + '"', 'color: rgb(22, 163, 74); font-weight: bold;', contenido);
}

/* ---------- FUNCIONES PARA USAR EN LA APP ---------- */

/* INSERT: guardarEnBD('usuarios', { nombre: 'Ana', correo: 'ana@mail.com' }) */
function guardarEnBD(tabla, datos) {
    var filas = leerTablaBD(tabla);
    var registro = {};
    var mayor = 0;

    filas.forEach(function (fila) {
        if (typeof fila.id === 'number' && fila.id > mayor) { mayor = fila.id; }
    });
    registro.id = datos.id !== undefined ? datos.id : mayor + 1;
    Object.keys(datos).forEach(function (campo) {
        if (campo !== 'id') { registro[campo] = datos[campo]; }
    });
    registro.creado_en = fechaAhoraBD();

    /* lo que se guarda nunca incluye contraseñas reales */
    filas.push(enmascararBD(registro));
    escribirTablaBD(tabla, filas);
    imprimirBD('INSERT', tabla, MOSTRAR_CLAVES ? registro : enmascararBD(registro));
    return registro;
}

/* UPDATE: actualizarEnBD('metas', 3, { ahorrado: 150000 })
           actualizarEnBD('usuarios', { correo: 'ana@mail.com' }, { clave: '...' }) */
function actualizarEnBD(tabla, donde, cambios) {
    var filas = leerTablaBD(tabla);
    var guardados = enmascararBD(cambios);

    filas.forEach(function (fila) {
        if (coincideBD(fila, donde)) {
            Object.keys(guardados).forEach(function (campo) { fila[campo] = guardados[campo]; });
            fila.actualizado_en = fechaAhoraBD();
        }
    });
    escribirTablaBD(tabla, filas);
    imprimirBD('UPDATE', tabla, { donde: donde, cambios: MOSTRAR_CLAVES ? cambios : guardados });
}

/* DELETE: eliminarDeBD('metas', 3) */
function eliminarDeBD(tabla, donde) {
    var filas = leerTablaBD(tabla).filter(function (fila) {
        return !coincideBD(fila, donde);
    });
    escribirTablaBD(tabla, filas);
    imprimirBD('DELETE', tabla, { donde: donde });
}

/* Escribe verBD() en la consola para ver todas las tablas */
function verBD() {
    var bd = JSON.parse(sessionStorage.getItem('bd_simulada')) || {};
    var tablas = Object.keys(bd);
    if (tablas.length === 0) {
        console.log('[BD simulada] Aún no hay datos guardados.');
        return;
    }
    tablas.forEach(function (tabla) {
        console.log('%c' + tabla, 'font-weight: bold;');
        console.table(bd[tabla]);
    });
}

/* ---------- PAGINAS DE OTROS COMPAÑEROS ----------
   Estas paginas ya tienen su propia logica, asi que aqui solo "escuchamos"
   sus formularios y botones, sin tocar sus archivos. */
(function () {
    var pagina = window.location.pathname.split('/').pop();

    function valor(id) {
        var campo = document.getElementById(id);
        return campo ? campo.value : '';
    }

    function alEnviar(id, accion) {
        var formulario = document.getElementById(id);
        if (formulario) { formulario.addEventListener('submit', accion); }
    }

    /* REGISTRO */
    if (pagina === 'registro.html') {
        document.querySelector('form.formulario').addEventListener('submit', function () {
            guardarEnBD('usuarios', { nombre: valor('nombre'), correo: valor('correo'), clave: valor('clave') });
        });
    }

    /* LOGIN */
    if (pagina === 'login.html') {
        document.querySelector('form.formulario').addEventListener('submit', function () {
            guardarEnBD('sesiones', { correo: valor('correo'), clave: valor('clave') });
        });
    }

    /* RECUPERAR CONTRASEÑA (3 pasos) */
    if (pagina === 'recuperar.html') {
        var correoRecuperacion = '';

        alEnviar('paso1', function () {
            correoRecuperacion = valor('correo');
            guardarEnBD('codigos_verificacion', { correo: correoRecuperacion, verificado: false });
        });
        alEnviar('paso2', function () {
            var codigo = '';
            document.querySelectorAll('.codigo input').forEach(function (caja) { codigo += caja.value; });
            actualizarEnBD('codigos_verificacion', { correo: correoRecuperacion }, { codigo_ingresado: codigo, verificado: true });
        });
        alEnviar('paso3', function () {
            actualizarEnBD('usuarios', { correo: correoRecuperacion }, { clave: valor('clave') });
        });
    }

    /* INGRESAR Y SACAR DINERO */
    if (pagina === 'ingresar-dinero.html') {
        var botonConfirmar = document.getElementById('boton-confirmar');
        botonConfirmar.addEventListener('click', function () {
            var cantidad = Number(valor('cantidad'));
            var activa = document.querySelector('.pestana.activa');
            var esRetiro = activa && activa.dataset.modo === 'sacar';
            var saldo = Number(sessionStorage.getItem('saldo')) || 0;

            guardarEnBD('movimientos', {
                tipo: esRetiro ? 'retiro' : 'ingreso',
                cantidad: cantidad,
                saldo_resultante: esRetiro ? saldo - cantidad : saldo + cantidad
            });
        });
    }
})();

