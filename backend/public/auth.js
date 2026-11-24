/* REGISTRO E INICIO DE SESION CON LA API
   Se carga SOLO en registro.html y login.html, DESPUES de api.js
   y ANTES de scripts.js (si no, scripts.js redirige sin esperar a la API). */
(function () {
    var pagina = window.location.pathname.split('/').pop();
    var formulario = document.querySelector('form.formulario');

    if (!formulario || (pagina !== 'registro.html' && pagina !== 'login.html')) {
        return;
    }

    var pantallaCarga = document.querySelector('.cargando');
    var boton = formulario.querySelector('.boton-amarillo');
    var textoBoton = boton.textContent;
    var mensaje = document.createElement('p');

    mensaje.className = 'mensaje-monto';
    formulario.insertBefore(mensaje, boton);

    /* ---------- FUNCIONES DE AYUDA ---------- */
    function valor(id) {
        return document.getElementById(id).value;
    }

    function mostrar(texto, esError) {
        mensaje.textContent = texto;
        mensaje.className = 'mensaje-monto' + (esError ? ' error' : '');
    }

    function ocupado(estaOcupado) {
        boton.disabled = estaOcupado;
        boton.textContent = estaOcupado ? 'Un momento...' : textoBoton;
    }

    function irA(destino) {
        pantallaCarga.classList.add('activo');
        setTimeout(function () {
            window.location.href = destino;
        }, 1500);
    }

    function traducirError(error) {
        var texto = (error.message || '').toLowerCase();

        if (texto.indexOf('already registered') !== -1) { return 'Este correo ya está registrado'; }
        if (texto.indexOf('invalid login') !== -1) { return 'Correo o contraseña incorrectos'; }
        if (texto.indexOf('not confirmed') !== -1) { return 'Debes confirmar tu correo antes de iniciar sesión'; }
        if (texto.indexOf('rate limit') !== -1) { return 'Hiciste demasiados intentos. Espera unos minutos'; }
        if (texto.indexOf('password') !== -1) { return 'La contraseña no cumple los requisitos'; }
        return 'No pudimos completar la acción. Intenta de nuevo';
    }

    /* error con "status" = la API respondio; sin "status" = no hubo conexion */
    function fallo(error) {
        console.error('Error con la API:', error);
        ocupado(false);
        if (error.status) {
            mostrar(traducirError(error), true);
        } else {
            mostrar('No hay conexión con el servidor. Revisa tu internet', true);
        }
    }

    /* ---------- REGISTRO ---------- */
    function registrar() {
        api.post('/auth/registro', {
            nombre: valor('nombre').trim(),
            correo: valor('correo').trim(),
            clave: valor('clave')
        }).then(function (respuesta) {
            ocupado(false);
            /* con la confirmacion de correo activa, un correo repetido no da error */
            if (respuesta.yaRegistrado) {
                mostrar('Este correo ya está registrado', true);
                return;
            }
            if (!respuesta.sesion) {
                mostrar('Te enviamos un correo para confirmar tu cuenta. Confírmalo y luego inicia sesión.', false);
                return;
            }
            api.guardarSesion(respuesta.sesion);
            irA(formulario.dataset.destino);
        }).catch(fallo);
    }

    /* ---------- INICIO DE SESION ---------- */
    function iniciarSesion() {
        api.post('/auth/login', {
            correo: valor('correo').trim(),
            clave: valor('clave')
        }).then(function (respuesta) {
            ocupado(false);
            api.guardarSesion(respuesta.sesion);
            irA(formulario.dataset.destino);
        }).catch(fallo);
    }

    /* ---------- ENVIO DEL FORMULARIO ---------- */
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        evento.stopImmediatePropagation();   /* evita que scripts.js redirija por su cuenta */
        mostrar('', false);
        ocupado(true);

        if (pagina === 'registro.html') {
            registrar();
        } else {
            iniciarSesion();
        }
    });
})();
