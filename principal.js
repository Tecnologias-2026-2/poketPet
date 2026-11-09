(function () {
    var pagina = window.location.pathname.split('/').pop();
 
    function mostrarDinero(selector, valor) {
        var elemento = document.querySelector(selector);
        if (elemento) { elemento.textContent = formatear(valor); }
    }
 
    /* ---------- MAIN: saldo e ingresos/gastos del mes ---------- */
    if (pagina === 'main.html') {
        datosApp.saldo().then(function (valor) {
            mostrarDinero('#saldo-valor', valor);
        }).catch(function (error) { console.error(error); });
 
        datosApp.resumenMes().then(function (resumen) {
            mostrarDinero('#ingresos-valor', resumen.ingresos);
            mostrarDinero('#gastos-valor', resumen.gastos);
        }).catch(function (error) { console.error(error); });
    }
 
    /* ---------- INGRESAR Y SACAR DINERO ---------- */
    if (pagina === 'ingresar-dinero.html') {
        var botonConfirmar = document.querySelector('#boton-confirmar');
        var campoCantidad = document.querySelector('#cantidad');
        var mensajeMonto = document.querySelector('#mensaje-monto');
        var pantallaCarga = document.querySelector('.cargando');
 
        /* trae los datos reales y se los da a las funciones que ya tenia scripts.js */
        Promise.all([datosApp.saldo(), datosApp.resumenMes(), datosApp.movimientos(10)]).then(function (r) {
            sessionStorage.setItem('saldo', r[0]);
            sessionStorage.setItem('ingresado', r[1].ingresos);
            sessionStorage.setItem('movimientos', JSON.stringify(r[2]));
            mostrarCifras();
            mostrarMovimientos();
            validar();
        }).catch(function (error) { console.error(error); });
 
        botonConfirmar.addEventListener('click', function (evento) {
            evento.stopImmediatePropagation();   /* evita el guardado antiguo de scripts.js */
            if (botonConfirmar.disabled) { return; }
 
            var pestanaActiva = document.querySelector('.pestana.activa');
            var tipo = pestanaActiva && pestanaActiva.dataset.modo === 'sacar' ? 'retiro' : 'ingreso';
 
            botonConfirmar.disabled = true;
            datosApp.registrarMovimiento(tipo, Number(campoCantidad.value)).then(function () {
                pantallaCarga.classList.add('activo');
                setTimeout(function () {
                    window.location.href = 'main.html';
                }, 1500);
            }).catch(function (error) {
                mensajeMonto.textContent = datosApp.textoError(error);
                mensajeMonto.className = 'mensaje-monto error';
            });
        });
    }
})();
 