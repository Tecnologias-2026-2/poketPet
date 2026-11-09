/* CONEXION CON SUPABASE
   Pega aqui los dos datos de tu proyecto (Project Settings > API):
   - Project URL
   - la clave PUBLICA (se llama "anon public" o "publishable key")

   NUNCA pegues aqui la clave "service_role" ni una que diga "secret":
   esa da acceso total a la base de datos y no debe estar en la app ni en GitHub. */
var SUPABASE_URL = 'https://uvyuruyukzgjgogoegxl.supabase.co';
var SUPABASE_CLAVE_PUBLICA = 'sb_publishable_frn4PoxHt1V96hA__5fWlg_e-6xh1aL';

/* "supabase" viene de la libreria que se carga antes desde el CDN */
var clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA);
