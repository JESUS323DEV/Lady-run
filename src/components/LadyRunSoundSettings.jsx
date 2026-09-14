import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Volume2 } from 'lucide-react';
import '../styles/components/LadyRunSoundSettings.css';

/**
 * Boton de ajustes de sonido de Lady Run (independiente de Pata y Pico, ver
 * feedback_sistemas_aislados). CSS totalmente propio, sin depender de ModalsMenu.css.
 * Solo musica/efectos, conectado a las claves propias music_volume_ladyrun / sfx_volume_ladyrun.
 */
const LadyRunSoundSettings = () => {
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
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default LadyRunSoundSettings;
