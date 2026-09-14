-- Perro de la ultima partida jugada por cada jugador (no el avatar equipado), para mostrarlo
-- corriendo en medio de su fila del Ranking. Subquery correlacionada: la fila de runs mas reciente
-- por profile_id. Va al final de la lista de columnas (mismo motivo que avatar_dog_id en
-- 005_leaderboard_avatar.sql: CREATE OR REPLACE VIEW no deja insertar en medio).
create or replace view public.leaderboard as
select
  p.id as profile_id,
  p.username,
  max(r.distance) as best_distance,
  p.avatar_dog_id,
  (
    select r2.dog_id
    from public.runs r2
    where r2.profile_id = p.id
    order by r2.created_at desc
    limit 1
  ) as last_dog_id
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username, p.avatar_dog_id;
