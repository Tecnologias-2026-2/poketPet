/* CONEXION CON LA API DE POCKET PET
   El navegador ya no habla con Supabase: solo con nuestra API (backend). */

var EN_LOCAL_SEPARADO = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                        && location.port !== '3000';
var API_URL = EN_LOCAL_SEPARADO ? 'http://localhost:3000/api' : '/api';
var CLAVE_SESION = 'pocketpet_sesion';

var api = (function () {
    function sesion() {
        try {
            var guardada = JSON.parse(localStorage.getItem(CLAVE_SESION));
            if (guardada && guardada.expires_at && guardada.expires_at * 1000 < Date.now()) {
                return null;
            }
            return guardada;
        } catch (e) {
            return null;
        }
    }

    function guardarSesion(datos) {
        localStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
    }

    function cerrarSesion() {
        localStorage.removeItem(CLAVE_SESION);
    }

    function pedir(metodo, ruta, cuerpo) {
        var actual = sesion();
        var opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };

        if (actual) { opciones.headers.Authorization = 'Bearer ' + actual.access_token; }
        if (cuerpo !== undefined) { opciones.body = JSON.stringify(cuerpo); }

        return fetch(API_URL + ruta, opciones).then(function (respuesta) {
            if (respuesta.status === 204) { return null; }

            return respuesta.json().catch(function () { return {}; }).then(function (datos) {
                if (!respuesta.ok) {
                    if (respuesta.status === 401 && ruta.indexOf('/auth/') !== 0) {
                        cerrarSesion();
                        window.location.href = 'login.html';
                    }
                    var error = new Error(datos.error || 'Error en la API');
                    error.status = respuesta.status;
                    throw error;
                }
                return datos;
            });
        });
    }

    return {
        sesion: sesion, guardarSesion: guardarSesion, cerrarSesion: cerrarSesion,
        get: function (ruta) { return pedir('GET', ruta); },
        post: function (ruta, cuerpo) { return pedir('POST', ruta, cuerpo || {}); },
        eliminar: function (ruta) { return pedir('DELETE', ruta); }
    };
})();