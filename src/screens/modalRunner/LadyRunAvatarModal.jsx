import { ArrowLeft } from 'lucide-react';
import '../../styles/modals/LadyRunAvatarModal.css';

// Pantalla de avatar de Lady Run: circulo grande con el avatar equipado + rejilla de perros ya
// desbloqueados para elegir uno nuevo (se guarda en profiles.avatar_dog_id, ver
// supabase/sql/004_profiles_avatar.sql). Mismo avatar que luego se ve en el Ranking.
export default function LadyRunAvatarModal({ onClose, currentAvatarDogId, avatarOptions, onEquip }) {
    const currentDog = avatarOptions.find(dog => dog.id === currentAvatarDogId);

    return (
        <div className="lady-run-shop-backdrop" onClick={onClose}>
            <div className="lady-run-shop-panel" onClick={e => e.stopPropagation()}>
                <button className="lady-run-back-btn" onClick={onClose}><ArrowLeft size={16} /></button>
                <p className="runner-overlay-title">Tu avatar</p>

                <div className="lady-run-avatar-preview">
                    {currentDog ? <img src={currentDog.icon} alt={currentDog.name} /> : null}
                </div>

                <div className="lady-run-avatar-grid">
                    {avatarOptions.map(dog => (
                        <button
                            key={dog.id}
                            className={`lady-run-avatar-option${dog.id === currentAvatarDogId ? ' lady-run-avatar-option-active' : ''}`}
                            onClick={() => onEquip(dog.id)}
                        >
                            <img src={dog.icon} alt={dog.name} className="lady-run-avatar-option-icon" />
                            <span className="lady-run-avatar-option-name">{dog.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
