import { useState } from 'react';
import logoLadyRun1 from '../../assets/ui/icons-hud/hud-modals/game-run/logo/logo-lady-run1.webp';
import '../../styles/standalone/LadyRunUsernameScreen.css';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,10}$/;

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
            setLocalError('3-10 caracteres: letras, números o guión bajo.');
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
