import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

// Identidad de Lady Run: cuenta anonima de Supabase creada sola (sin password ni email reales),
// mas un ID elegido por el jugador para el ranking global (tabla profiles, 1 fila por usuario,
// ver supabase/sql/001_profiles.sql). Mas adelante, si hace falta password/email de verdad,
// se puede "reclamar" esta misma cuenta anonima (supabase.auth.updateUser) sin perder el ID.
export const useLadyRunProfile = () => {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initError, setInitError] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState(null);
    // Si el redirect de vuelta de Google trae un error de "esta cuenta de Google ya esta vinculada
    // a otro usuario" (linkIdentity falla asi cuando entras desde un navegador/dispositivo nuevo
    // que ya tiene su propia cuenta anonima), se guarda aqui para ofrecer entrar a esa cuenta en
    // vez de vincular (ver signInWithGoogleAccount).
    const [linkGoogleIdentityExists, setLinkGoogleIdentityExists] = useState(false);
    const [linkGoogleError, setLinkGoogleError] = useState(null);

    // Supabase manda el resultado del OAuth como parametros en el hash de la URL al volver
    // (#error=...&error_code=...), tanto para linkIdentity como para signInWithOAuth. Se lee una
    // sola vez al montar y se limpia el hash para que un refresh no lo vuelva a procesar.
    useEffect(() => {
        if (!window.location.hash) return;
        const params = new URLSearchParams(window.location.hash.slice(1));
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');
        if (errorCode) {
            if (errorCode === 'identity_already_exists') {
                setLinkGoogleIdentityExists(true);
            } else {
                setLinkGoogleError(errorDescription || errorCode);
            }
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            let { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                const { data, error } = await supabase.auth.signInAnonymously();
                if (error) {
                    if (!cancelled) { setInitError(error.message); setLoading(false); }
                    return;
                }
                if (cancelled) return;
                currentSession = data.session;
            }
            if (cancelled) return;
            setSession(currentSession);

            const { data: profileRow, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, avatar_dog_id, avatar_frame_id, avatar_skin_id, chapas, tavern_coins, huesin, progress')
                .eq('id', currentSession.user.id)
                .maybeSingle();

            if (!cancelled) {
                if (profileError) {
                    // Fallo real de conexion/consulta: nunca tratarlo como "no tienes perfil todavia",
                    // o mandaria a un jugador YA registrado a la pantalla de elegir ID otra vez.
                    setInitError(profileError.message);
                } else {
                    setProfile(profileRow ?? null);
                }
                setLoading(false);
            }
        };

        init();
        return () => { cancelled = true; };
    }, []);

    const claimUsername = useCallback(async (username) => {
        if (!session) return false;
        setClaiming(true);
        setClaimError(null);
        const { data, error } = await supabase
            .from('profiles')
            .insert({ id: session.user.id, username })
            .select('id, username, avatar_dog_id, avatar_frame_id, avatar_skin_id, chapas, tavern_coins, huesin, progress')
            .single();
        setClaiming(false);

        if (error) {
            const message = error.code === '23505' ? 'Ese ID ya está en uso, prueba otro.'
                : error.code === '23514' ? 'Ese ID no está permitido, elige otro.'
                : 'No se pudo guardar, inténtalo de nuevo.';
            setClaimError(message);
            return false;
        }
        setProfile(data);
        return true;
    }, [session]);

    const equipAvatar = useCallback(async (dogId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_dog_id: dogId })
            .eq('id', session.user.id)
            .select('avatar_dog_id')
            .single();

        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    const equipAvatarFrame = useCallback(async (frameId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_frame_id: frameId })
            .eq('id', session.user.id)
            .select('avatar_frame_id')
            .single();

        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Skin equipada del perro-avatar actual (no de todos los perros, solo el que es tu avatar ahora
    // mismo): se resincroniza desde LadyRunStandalone.jsx cada vez que cambias de perro-avatar o de
    // skin equipada para ese perro, ver 012_profiles_avatar_skin.sql.
    const equipAvatarSkin = useCallback(async (skinId) => {
        if (!session) return false;
        const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_skin_id: skinId })
            .eq('id', session.user.id)
            .select('avatar_skin_id')
            .single();

        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Suma moneda (recogida jugando) llamando a la funcion de Supabase, nunca escribiendo el
    // numero directamente - ver supabase/sql/008_profiles_currency.sql.
    const earnCurrency = useCallback(async ({ chapas = 0, tavernCoins = 0, huesin = 0 } = {}) => {
        if (!session) return false;
        const { data, error } = await supabase
            .rpc('earn_currency', { p_chapas: chapas, p_tavern_coins: tavernCoins, p_huesin: huesin })
            .single();
        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Gasta moneda en un item del catalogo (precio fijo en el servidor). Devuelve false si no hay
    // saldo suficiente, sin tocar nada. progressPatch opcional: si se manda, se fusiona con
    // profiles.progress en la MISMA transaccion que el pago (ver 022_progress_sync.sql) - asi comprar
    // un perro/marco/skin no se puede "separar" en pagar sin recibir nada.
    const spendCurrency = useCallback(async (itemId, progressPatch = null) => {
        if (!session) return false;
        const { data, error } = await supabase
            .rpc('spend_currency', { p_item_id: itemId, p_progress_patch: progressPatch })
            .single();
        if (error) return false;
        setProfile(prev => (prev ? { ...prev, ...data } : prev));
        return true;
    }, [session]);

    // Progreso que antes vivia solo en localStorage (tutoriales, desbloqueos sin coste, corazones
    // consumidos, contadores diarios, records locales...) - ver 022_progress_sync.sql. Mismo patron
    // que un useState funcional: updater recibe el progreso actual y devuelve el progreso NUEVO
    // completo (no un patch), para poder reusar tal cual las funciones que antes se le pasaban a
    // setGameState. Optimista: actualiza el estado local ya, guarda en Supabase de fondo.
    const updateProgress = useCallback((updater) => {
        setProfile(prev => {
            if (!prev) return prev;
            const nextProgress = typeof updater === 'function' ? updater(prev.progress ?? {}) : updater;
            supabase.from('profiles').update({ progress: nextProgress }).eq('id', prev.id).then(({ error }) => {
                if (error) console.error('No se pudo guardar el progreso', error);
            });
            return { ...prev, progress: nextProgress };
        });
    }, []);

    const googleLinked = session?.user?.identities?.some(identity => identity.provider === 'google') ?? false;

    // Primer paso normal: vincula Google a la cuenta anonima actual, sin perder perros/marcos/
    // monedas ya guardados. Si esa cuenta de Google ya esta vinculada a OTRO usuario (por ejemplo,
    // entras desde un movil que ya tenia su propia cuenta anonima nueva), Supabase redirige de
    // vuelta con error_code=identity_already_exists en vez de vincular - ver el useEffect de arriba
    // y signInWithGoogleAccount, que es la salida para ese caso.
    const linkGoogleAccount = useCallback(async () => {
        setLinkGoogleError(null);
        const { error } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) setLinkGoogleError(error.message);
    }, []);

    // Entra directamente a la cuenta ya vinculada a esa Google (sustituye la sesion anonima local
    // de este navegador/dispositivo, con su progreso de invitado, por la cuenta real que ya existe).
    const signInWithGoogleAccount = useCallback(async () => {
        setLinkGoogleError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) setLinkGoogleError(error.message);
    }, []);

    return {
        loading, initError, profile, claiming, claimError, claimUsername,
        equipAvatar, equipAvatarFrame, equipAvatarSkin, earnCurrency, spendCurrency, updateProgress,
        googleLinked, linkGoogleAccount, signInWithGoogleAccount,
        linkGoogleIdentityExists, linkGoogleError,
    };
};
