var cargando = document.querySelector('.cargando');
var formularios = document.querySelectorAll('form');

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
/* Enlace pantalla de caraga categorias y metas*/
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
/*ventana de perfil */
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
/* menu scrooll*/
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