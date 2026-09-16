-- Skin equipada del perro que es tu avatar (id del catalogo SKIN_CATALOG para ese perro, ej.
-- 'pirata'/'ultimate'...), nullable si no tiene ninguna equipada para ese perro. Se guarda en
-- Supabase (no solo local, a diferencia de ladyRunEquippedSkinByDog que sigue siendo local para el
-- resto de perros) por lo mismo que avatar_dog_id/avatar_frame_id: se muestra en el Ranking, que es
-- publico. Se resincroniza en el cliente cada vez que cambia el perro-avatar o su skin equipada
-- (ver LadyRunStandalone.jsx).
alter table public.profiles add column avatar_skin_id text;

grant update (avatar_skin_id) on public.profiles to authenticated;

-- Se añade al final del SELECT (no junto a avatar_frame_id) por lo mismo que 011: CREATE OR REPLACE
-- VIEW no permite reordenar/insertar columnas en medio, solo anadir al final.
create or replace view public.leaderboard as
select
  p.id as profile_id,
  p.username,
  p.avatar_dog_id,
  r.difficulty,
  max(r.distance) as best_distance,
  (
    select r2.dog_id
    from public.runs r2
    where r2.profile_id = p.id and r2.difficulty = r.difficulty
    order by r2.created_at desc
    limit 1
  ) as last_dog_id,
  p.avatar_frame_id,
  p.avatar_skin_id
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username, p.avatar_dog_id, r.difficulty, p.avatar_frame_id, p.avatar_skin_id;

grant select on public.leaderboard to anon, authenticated;
