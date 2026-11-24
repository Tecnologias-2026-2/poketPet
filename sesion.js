(function () {
    if (typeof api === 'undefined') {
        console.error('sesion.js: falta cargar api.js antes');
        return;
    }

    /* oculta la pagina hasta saber si hay sesion, para no mostrar datos a quien no entro */
    document.documentElement.style.visibility = 'hidden';

    function texto(selector, valor) {
        document.querySelectorAll(selector).forEach(function (elemento) {
            elemento.textContent = valor;
        });
    }

    function mesYAnio(fecha) {
        return new Date(fecha).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    }

    function mostrarUsuario(usuario) {
        var nombre = (usuario.user_metadata && usuario.user_metadata.nombre) || 'Usuario';
        var inicial = nombre.charAt(0).toUpperCase();

        texto('#nombre-usuario', nombre);
        texto('.avatar-perfil', inicial);
        texto('.avatar-grande', inicial);
        texto('.perfil-principal b', nombre);
        texto('.perfil-principal small', usuario.email);

        document.querySelectorAll('.dato').forEach(function (fila) {
            var etiqueta = fila.querySelector('span').textContent.toLowerCase();
            var valor = fila.querySelector('b');
            if (etiqueta === 'nombre') { valor.textContent = nombre; }
            if (etiqueta === 'correo') { valor.textContent = usuario.email; }
            if (etiqueta === 'miembro desde') { valor.textContent = mesYAnio(usuario.created_at); }
        });
    }

    function conectarSalir() {
        document.querySelectorAll('.salir, .ventana-pie a').forEach(function (enlace) {
            enlace.addEventListener('click', function (evento) {
                evento.preventDefault();
                api.cerrarSesion();
                window.location.href = 'landingpage.html';
            });
        });
    }

    var sesionActual = api.sesion();

    if (!sesionActual) {
        window.location.href = 'login.html';
        return;
    }
    mostrarUsuario(sesionActual.user);
    conectarSalir();
    document.documentElement.style.visibility = 'visible';
})();