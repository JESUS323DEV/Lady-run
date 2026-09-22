import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Volume2, User } from 'lucide-react';
import '../styles/components/LadyRunSoundSettings.css';

/**
 * Boton de ajustes de sonido de Lady Run (independiente de Pata y Pico, ver
 * feedback_sistemas_aislados). CSS totalmente propio, sin depender de ModalsMenu.css.
 * Solo musica/efectos, conectado a las claves propias music_volume_ladyrun / sfx_volume_ladyrun.
 * Tambien vive aqui vincular Google a la cuenta (ver project_lady_run_online_plan / useLadyRunProfile.js),
 * ya que es el unico panel de "ajustes de cuenta" que existe en Lady Run.
 */
const LadyRunSoundSettings = ({
    googleLinked = false, onLinkGoogle, onSignInGoogle, onSignOut, linkGoogleIdentityExists = false, linkGoogleError = null,
}) => {
    const [open, setOpen] = useState(false);
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('music_volume_ladyrun');
        return saved === null ? 0.06 : parseFloat(saved);
    });
    const [sfxVolume, setSfxVolume] = useState(() => {
        const saved = localStorage.getItem('sfx_volume_ladyrun');
        return saved === null ? 0.09 : parseFloat(saved);
    });

    const handleMusicVolume = (value) => {
        setMusicVolume(value);
        localStorage.setItem('music_volume_ladyrun', String(value));
        window.dispatchEvent(new CustomEvent('ladyrun-music-volume', { detail: value }));
    };

    const handleSfxVolume = (value) => {
        setSfxVolume(value);
        localStorage.setItem('sfx_volume_ladyrun', String(value));
    };

    return (
        <>
            <button className="ladyrun-sound-btn" onClick={() => setOpen(true)}>
                <Settings size={18} />
            </button>
            {open && createPortal(
                <div className="ladyrun-settings-overlay" onClick={() => setOpen(false)}>
                    <div className="ladyrun-settings-panel" onClick={e => e.stopPropagation()}>
                        <div className="ladyrun-settings-header">
                            <span className="ladyrun-settings-title"><Volume2 size={16} /> Sonido</span>
                            <button className="ladyrun-settings-close" onClick={() => setOpen(false)}><X size={18} /></button>
                        </div>
                        <div className="ladyrun-settings-list">
                            <div className="ladyrun-settings-group">
                                <div className="ladyrun-settings-item">
                                    <span className="ladyrun-settings-item-icon"><Volume2 size={18} /></span>
                                    <span className="ladyrun-settings-item-label">Música</span>
                                </div>
                                <div className="ladyrun-settings-volume-row">
                                    <input
                                        type="range"
                                        min={0}
                                        max={0.5}
                                        step={0.01}
                                        value={musicVolume}
                                        onChange={e => handleMusicVolume(parseFloat(e.target.value))}
                                        className="ladyrun-volume-slider"
                                    />
                                </div>
                                <div className="ladyrun-settings-item">
                                    <span className="ladyrun-settings-item-icon"><Volume2 size={18} /></span>
                                    <span className="ladyrun-settings-item-label">Efectos</span>
                                </div>
                                <div className="ladyrun-settings-volume-row">
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={sfxVolume}
                                        onChange={e => handleSfxVolume(parseFloat(e.target.value))}
                                        className="ladyrun-volume-slider"
                                    />
                                </div>
                            </div>

                            <div className="ladyrun-settings-group">
                                <div className="ladyrun-settings-item">
                                    <span className="ladyrun-settings-item-icon"><User size={18} /></span>
                                    <span className="ladyrun-settings-item-label">Cuenta</span>
                                </div>
                                <div className="ladyrun-settings-account-row">
                                    {googleLinked ? (
                                        <span className="ladyrun-settings-account-linked">Vinculada con Google</span>
                                    ) : (
                                        <>
                                            <p className="ladyrun-settings-account-hint">Ahora mismo juegas como invitado: tu progreso vive solo en este navegador.</p>
                                            <button className="ladyrun-settings-account-btn" onClick={onLinkGoogle}>Vincula tu cuenta con Google</button>
                                            <button className="ladyrun-settings-account-btn ladyrun-settings-account-btn-secondary" onClick={onSignInGoogle}>Ya tengo cuenta, iniciar sesión</button>
                                            {linkGoogleIdentityExists && (
                                                <p className="ladyrun-settings-account-hint">Esa cuenta de Google ya está registrada. Usa "Ya tengo cuenta, iniciar sesión".</p>
                                            )}
                                        </>
                                    )}
                                    {linkGoogleError && <p className="ladyrun-settings-account-error">{linkGoogleError}</p>}
                                    <button className="ladyrun-settings-account-btn ladyrun-settings-account-btn-secondary" onClick={onSignOut}>Cerrar sesión</button>
                                </div>
                            </div>

                            <div className="ladyrun-settings-group">
                                <div className="ladyrun-settings-legal-row">
                                    <a href="/privacidad">Política de privacidad</a>
                                    <a href="/terminos">Condiciones del servicio</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default LadyRunSoundSettings;
