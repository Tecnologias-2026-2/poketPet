/* REGISTRO E INICIO DE SESION CON SUPABASE
   Se carga SOLO en registro.html y login.html, DESPUES de supabaseClient.js
   y ANTES de scripts.js (si no, scripts.js redirige sin esperar a Supabase). */
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

    function falloDeRed(error) {
        console.error('Error con Supabase:', error);
        ocupado(false);
        mostrar('No hay conexión con el servidor. Revisa tu internet', true);
    }

    /* ---------- REGISTRO ---------- */
    function registrar() {
        clienteSupabase.auth.signUp({
            email: valor('correo').trim(),
            password: valor('clave'),
            options: { data: { nombre: valor('nombre').trim() } }
        }).then(function (respuesta) {
            var error = respuesta.error;
            var usuario = respuesta.data && respuesta.data.user;

            ocupado(false);
            if (error) {
                console.error('Error al registrar:', error);
                mostrar(traducirError(error), true);
                return;
            }
            /* con la confirmacion de correo activa, un correo repetido no da error: llega sin identidades */
            if (usuario && usuario.identities && usuario.identities.length === 0) {
                mostrar('Este correo ya está registrado', true);
                return;
            }
            if (!respuesta.data.session) {
                mostrar('Te enviamos un correo para confirmar tu cuenta. Confírmalo y luego inicia sesión.', false);
                return;
            }
            irA(formulario.dataset.destino);
        }).catch(falloDeRed);
    }

    /* ---------- INICIO DE SESION ---------- */
    function iniciarSesion() {
        clienteSupabase.auth.signInWithPassword({
            email: valor('correo').trim(),
            password: valor('clave')
        }).then(function (respuesta) {
            ocupado(false);
            if (respuesta.error) {
                console.error('Error al iniciar sesión:', respuesta.error);
                mostrar(traducirError(respuesta.error), true);
                return;
            }
            irA(formulario.dataset.destino);
        }).catch(falloDeRed);
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
