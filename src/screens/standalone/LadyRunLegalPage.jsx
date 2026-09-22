import logoLadyRun1 from '../../assets/ui/icons-hud/hud-modals/game-run/logo/logo-lady-run1.webp';
import '../../styles/standalone/LadyRunLegalPage.css';

// Paginas de Politica de Privacidad y Condiciones, exigidas por Google para poder publicar el
// proveedor de login (ver Google Auth Platform > Informacion de la marca). Reachable por URL directa
// (/privacidad, /terminos) desde App.jsx, sin router - ver public/_redirects para el fallback de SPA
// que hace falta en Netlify para que esas rutas no den 404 al entrar directo.
const PRIVACY_CONTENT = (
    <>
        <h2>Qué datos se guardan</h2>
        <p>Al entrar a Lady Run se crea una cuenta anónima automática (sin email ni contraseña), a la que se asocia:</p>
        <ul>
            <li>El ID que elijas para el ranking global (público, lo ve cualquiera en el Ranking).</li>
            <li>Tu perro, marco y skin equipados (público, se muestra en el Ranking).</li>
            <li>Tus chapas, monedas y huesín, y tu progreso de juego (perros/marcos/skins desbloqueados, tutorial, corazones, récords).</li>
        </ul>
        <p>Si decides vincular tu cuenta a Google, Google comparte con la app tu email y nombre de perfil, usados solo para identificar tu cuenta y permitirte entrar desde otros dispositivos con la misma cuenta de Google.</p>

        <h2>Cookies y analítica</h2>
        <p>Al aceptar el aviso de cookies se activa Google Analytics, para entender cómo se juega y qué mejorar. Si lo rechazas, no se carga nada de analítica. Puedes cambiar tu decisión borrando las cookies del navegador.</p>

        <h2>Con quién se comparten los datos</h2>
        <p>No se venden ni se comparten datos con terceros para publicidad. Los únicos servicios externos usados son Supabase (donde vive la base de datos y el login), Google (login opcional y analítica, solo si aceptas cookies) y Netlify (donde está alojada la web).</p>

        <h2>Cómo borrar tu cuenta</h2>
        <p>Escribe a <a href="mailto:jtipian90@gmail.com">jtipian90@gmail.com</a> pidiendo el borrado, indicando tu ID del ranking, y se elimina tu cuenta y todos sus datos.</p>

        <h2>Contacto</h2>
        <p>Cualquier duda sobre esta política: <a href="mailto:jtipian90@gmail.com">jtipian90@gmail.com</a>.</p>
    </>
);

const TERMS_CONTENT = (
    <>
        <h2>Qué es Lady Run</h2>
        <p>Lady Run es un juego gratuito hecho por una sola persona, en desarrollo activo. Las funciones pueden cambiar, añadirse o quitarse en cualquier momento sin aviso previo.</p>

        <h2>Tu cuenta</h2>
        <p>El ID que elijas para el ranking es tuyo mientras uses la cuenta; no se puede cambiar una vez elegido. No está permitido usar IDs ofensivos, ni suplantar a otra persona o marca.</p>

        <h2>Mejora constante</h2>
        <p>Lady Run está en desarrollo activo y mejora constantemente. Nos esforzamos por que todo funcione bien, aunque puede haber algún fallo puntual mientras seguimos creciendo.</p>

        <h2>Contacto</h2>
        <p>Dudas o problemas: <a href="mailto:jtipian90@gmail.com">jtipian90@gmail.com</a>.</p>
    </>
);

const LadyRunLegalPage = ({ page }) => {
    const isTerms = page === 'terminos';
    return (
        <div className="lady-run-legal-screen">
            <img src={logoLadyRun1} alt="Lady Run" className="lady-run-legal-logo" />
            <h1 className="lady-run-legal-title">{isTerms ? 'Condiciones del servicio' : 'Política de privacidad'}</h1>
            <div className="lady-run-legal-content">
                {isTerms ? TERMS_CONTENT : PRIVACY_CONTENT}
            </div>
            <a className="lady-run-legal-back" href="/">Volver a Lady Run</a>
        </div>
    );
};

export default LadyRunLegalPage;
