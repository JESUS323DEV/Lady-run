import bgPrincipalTrack from '../../assets/audio/lady-run/bg-principal.mp3';
import bosqueTrack from '../../assets/audio/lady-run/sound-exterior/bosque-1-exterior.mp3';
import ciudadTrack from '../../assets/audio/lady-run/sound-exterior/run-exterior.mp3';
import desiertoTrack from '../../assets/audio/lady-run/sound-exterior/run-exterior-2-trim.mp3';
import praderaTrack from '../../assets/audio/lady-run/sound-exterior/run-exterior-3-trim.mp3';
import hieloTrack from '../../assets/audio/lady-run/sound-exterior/run-exterior-4.mp3';
import interiorTrack1 from '../../assets/audio/lady-run/sound-interior/run-interior.mp3';
import interiorTrack2 from '../../assets/audio/lady-run/sound-interior/run-interior-2.mp3';

// Musica de Modo Libre: 1 pista fija por escenario exterior, y minas (unico interior) sortea entre
// las 2 pistas de sound-interior/ cada vez que se entra a ese escenario. sound-boss/ existe pero no
// se conecta todavia (pendiente).
export const LIBRE_SCENE_MUSIC = {
    bosque: bosqueTrack,
    ciudad: ciudadTrack,
    desierto: desiertoTrack,
    pradera: praderaTrack,
    hielo: hieloTrack,
};

export const MINAS_MUSIC_TRACKS = [interiorTrack1, interiorTrack2];

// Suena en las pantallas de seleccion (antes de darle a Empezar), en Modo Libre y las demas por ahora.
export const BG_PRINCIPAL_TRACK = bgPrincipalTrack;
