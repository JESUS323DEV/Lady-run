import { RefreshCw } from 'lucide-react';
import { useNewVersionAvailable } from '../game/hooks/useNewVersionAvailable.js';
import '../styles/components/UpdateBanner.css';

// Aviso de version nueva disponible (ver useNewVersionAvailable.js). Nunca recarga solo: el jugador
// decide cuando, para no cortarle una partida en curso.
const UpdateBanner = () => {
    const updateAvailable = useNewVersionAvailable();
    if (!updateAvailable) return null;

    return (
        <button className="update-banner" onClick={() => window.location.reload()}>
            <RefreshCw size={14} />
            Hay una versión nueva, pulsa para actualizar
        </button>
    );
};

export default UpdateBanner;
