var cargando = document.querySelector('.cargando');
var formularios = document.querySelectorAll('form');

formularios.forEach(function (formulario) {
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        cargando.classList.add('activo');
        setTimeout(function () {
            window.location.href = formulario.dataset.destino;
        }, 2000);
    });
});