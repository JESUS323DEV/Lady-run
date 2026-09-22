import LadyRunStandalone from './screens/standalone/LadyRunStandalone.jsx'
import LadyRunLegalPage from './screens/standalone/LadyRunLegalPage.jsx'
import UpdateBanner from './components/UpdateBanner.jsx'
import CookieConsentBanner from './components/CookieConsentBanner.jsx'

// Sin router (no hace falta, es una sola pantalla) - /privacidad y /terminos son las 2 unicas rutas
// extra, exigidas por Google para poder publicar el login (ver Google Auth Platform > Informacion de
// la marca). Necesitan public/_redirects para no dar 404 al entrar directo por URL en Netlify.
const path = typeof window !== 'undefined' ? window.location.pathname : '/';

function App() {
  if (path === '/privacidad') return <LadyRunLegalPage page="privacidad" />;
  if (path === '/terminos') return <LadyRunLegalPage page="terminos" />;

  return (
    <>
      <LadyRunStandalone />
      <UpdateBanner />
      <CookieConsentBanner />
    </>
  );
}

export default App
