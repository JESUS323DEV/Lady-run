// Clave de rotacion diaria (YYYY-MM-DD, con offset opcional para el panel de debug) usada para los
// contadores de botin/tramos diarios de Lady Run. Copia propia, independiente de la de Pata y Pico.
export const getDailyRotationKey = (dayOffset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().slice(0, 10);
};
