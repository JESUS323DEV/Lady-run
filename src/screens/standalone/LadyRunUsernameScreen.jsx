import { useState } from 'react';
import logoLadyRun1 from '../../assets/ui/icons-hud/hud-modals/game-run/logo/logo-lady-run1.webp';
import '../../styles/standalone/LadyRunUsernameScreen.css';

const USERNAME_REGEX = /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑüÜ]{3,10}$/;

// Filtro rapido en cliente (feedback instantaneo). El filtro de verdad, que no se puede saltar, esta
// en Supabase (ver supabase/sql/021_username_lista_negra.sql) - misma lista y misma normalizacion
// de leetspeak (0->o, 4->a, 3->e, 1->i, 5->s, 7->t, @->a) para que "P3n3" caiga igual que "pene".
const BLOCKED_USERNAME_WORDS = [
    'puta', 'puto', 'mierda', 'polla', 'pene', 'coño', 'cono', 'cabron', 'joder', 'zorra',
    'maricon', 'marica', 'marico', 'gilipollas', 'perra', 'follar', 'pendejo',
    'gonorrea', 'hijueputa', 'hijoeputa', 'malparido', 'malparida',
    'verga', 'pajero', 'concha', 'boludo', 'boluda', 'chucha', 'huevon', 'huevón', 'guevon', 'guevón',
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'cock', 'porn', 'nigger', 'nigga',
    'nazi', 'hitler', 'anal', 'sexo', 'penis', 'vagina',
];
const LEETSPEAK_MAP = { '0': 'o', '4': 'a', '3': 'e', '1': 'i', '5': 's', '7': 't', '@': 'a' };
const normalizeLeetspeak = (str) => str.toLowerCase().split('').map(c => LEETSPEAK_MAP[c] ?? c).join('');
const containsBlockedWord = (username) => {
    const normalized = normalizeLeetspeak(username);
    return BLOCKED_USERNAME_WORDS.some(word => normalized.includes(word));
};

// Paso previo a LadyRunLanding la primera vez que se juega: elegir el ID del ranking global.
// Va sobre una cuenta anonima ya creada (ver useLadyRunProfile), asi que aqui no hay password
// ni email, solo el texto que se va a ver en el ranking.
const LadyRunUsernameScreen = ({ onSubmit, submitting, errorMsg }) => {
    const [value, setValue] = useState('');
    const [localError, setLocalError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!USERNAME_REGEX.test(trimmed)) {
            setLocalError('3-10 caracteres: letras (con o sin tilde), números o guión bajo.');
            return;
        }
        if (containsBlockedWord(trimmed)) {
            setLocalError('Ese ID no está permitido, elige otro.');
            return;
        }
        setLocalError(null);
        onSubmit(trimmed);
    };

    return (
        <div className="lady-run-username-screen">
            <img src={logoLadyRun1} alt="Lady Run" className="lady-run-username-logo" />
            <p className="lady-run-username-title">Elige tu ID</p>
            <p className="lady-run-username-subtitle">Así apareces en el ranking global.</p>
            <form className="lady-run-username-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Tu ID"
                    maxLength={10}
                    autoFocus
                    disabled={submitting}
                />
                {(localError || errorMsg) && <p className="lady-run-username-error">{localError || errorMsg}</p>}
                <button type="submit" className="lady-run-username-submit-btn" disabled={submitting || !value.trim()}>
                    {submitting ? '...' : 'Confirmar'}
                </button>
            </form>
        </div>
    );
};

export default LadyRunUsernameScreen;
