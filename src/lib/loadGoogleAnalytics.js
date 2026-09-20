const GA_MEASUREMENT_ID = 'G-RB459P8270';

// Carga Google Analytics solo cuando el usuario acepta cookies (ver CookieConsentBanner.jsx). Antes
// de eso el script ni siquiera se pide, para no poner cookies de analitica sin consentimiento previo.
export const loadGoogleAnalytics = () => {
    if (window.gtag) return; // ya cargado (por ejemplo si el efecto se dispara dos veces)

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
};
