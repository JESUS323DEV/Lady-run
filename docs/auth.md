# Cuentas y autenticación

## Cómo entra un jugador

Al abrir Lady Run por primera vez se crea automáticamente una cuenta anónima de Supabase (`supabase.auth.signInAnonymously()`), sin email ni contraseña. Esa cuenta anónima es la identidad real del jugador desde el minuto uno - todo lo demás se construye encima.

Sin fila en `profiles` todavía (nadie ha elegido un ID), se muestra `LadyRunUsernameScreen` ("Elige tu ID"). Al confirmar un ID, `claimUsername` hace un `insert` en `profiles` y ahí empieza a existir el jugador de verdad (con `username`, el resto de columnas a sus valores por defecto).

## Vincular Google

Dos acciones distintas, con dos funciones de Supabase Auth distintas:

- **`linkGoogleAccount` → `supabase.auth.linkIdentity({ provider: 'google' })`**: añade Google como identidad de la cuenta anónima ACTUAL, sin crear nada nuevo. Se usa cuando ya tienes progreso en este navegador y quieres "asegurarlo" con Google. Botón: "Registrarme con Google" (pantalla inicial) / "Vincula tu cuenta con Google" (Ajustes).
- **`signInWithGoogleAccount` → `supabase.auth.signInWithOAuth({ provider: 'google' })`**: inicia sesión en la cuenta que YA está vinculada a esa Google, sustituyendo la sesión anónima local (con su progreso) por la cuenta real. Se usa en un dispositivo nuevo. Botón: "Ya tengo cuenta, iniciar sesión".

Si intentas `linkIdentity` con una Google que ya está vinculada a OTRO usuario, Supabase redirige de vuelta con `error_code=identity_already_exists` en el hash de la URL (`useLadyRunProfile.js` lo detecta en un `useEffect` al montar) - en ese caso se muestra un aviso sugiriendo usar "Ya tengo cuenta" en su lugar.

`signOut` (`supabase.auth.signOut()` + recarga) cierra la sesión y deja el dispositivo listo para una cuenta nueva o para iniciar sesión con otra Google.

## Qué comparte Google

Solo email y nombre de perfil básico (scopes por defecto de "Sign in with Google" vía Supabase, sin permisos sensibles ni restringidos) - usados solo para identificar la cuenta, nunca mostrados en el juego.

## Estado de la app de Google (Google Cloud)

Publicada en producción (`Google Auth Platform → Público`), cualquier cuenta de Google puede vincularse o iniciar sesión, sin necesidad de añadirla a mano a ninguna lista de prueba.

## Limitación conocida

Si un jugador ya tiene progreso de invitado en DOS navegadores distintos (sin haber vinculado Google en ninguno todavía) y luego inicia sesión con Google en uno de ellos desde el otro, el progreso del segundo navegador se abandona - no hay fusión automática de dos progresos distintos, solo se puede quedarse con uno.
