import { supabase } from '../../lib/supabase.js';

// Guarda 1 partida de Modo Libre terminada en la tabla runs (ver supabase/sql/002_runs.sql), para
// ranking global/por escenario y estadisticas de perros. Fire-and-forget: si falla, no debe cortar
// ni el game over ni el resto del juego, solo se pierde ese registro online (el progreso local no
// depende de esto).
export const saveLadyRunOnlineRun = async ({ dogId, biome, difficulty, distance }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('runs').insert({
        profile_id: session.user.id,
        dog_id: dogId,
        biome,
        difficulty,
        distance,
    });
    if (error) console.error('No se pudo guardar la partida online:', error.message);
};
