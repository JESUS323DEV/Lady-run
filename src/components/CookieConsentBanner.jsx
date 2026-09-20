import { useEffect, useState } from 'react';
import { loadGoogleAnalytics } from '../lib/loadGoogleAnalytics.js';
import '../styles/components/CookieConsentBanner.css';

const STORAGE_KEY = 'ladyRunCookieConsent'; // 'accepted' | 'rejected'

// Aviso de cookies: Analytics no se carga hasta que el usuario acepta (ver loadGoogleAnalytics.js).
// No bloquea nada del juego, solo decide si se activa el seguimiento o no. Se muestra una vez, encima
// de cualquier pantalla, hasta que el usuario responde; la decision se recuerda y no se vuelve a pedir.
const CookieConsentBanner = () => {
    const [answered, setAnswered] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'accepted') loadGoogleAnalytics();
        setAnswered(stored === 'accepted' || stored === 'rejected');
    }, []);

    const respond = (choice) => {
        localStorage.setItem(STORAGE_KEY, choice);
        if (choice === 'accepted') loadGoogleAnalytics();
        setAnswered(true);
    };

    if (answered) return null;

    return (
        <div className="cookie-consent-banner">
            <p className="cookie-consent-text">
                Usamos cookies para saber cómo se juega a Lady Run y qué podemos mejorar.
            </p>
            <div className="cookie-consent-actions">
                <button className="cookie-consent-btn cookie-consent-btn-reject" onClick={() => respond('rejected')}>Rechazar</button>
                <button className="cookie-consent-btn cookie-consent-btn-accept" onClick={() => respond('accepted')}>Aceptar</button>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
