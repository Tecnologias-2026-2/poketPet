const supabase = require('../database/supabase');

exports.registrar = (correo, clave, nombre) =>
  supabase.auth.signUp({ email: correo, password: clave, options: { data: { nombre } } });

exports.iniciarSesion = (correo, clave) =>
  supabase.auth.signInWithPassword({ email: correo, password: clave });

exports.usuarioDesdeToken = (token) => supabase.auth.getUser(token);