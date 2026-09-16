-- Marco de avatar equipado (id del catalogo AVATAR_FRAMES en ladyRunAvatarFramesCatalog.js, ej.
-- 'bronze-1'/'celeste-1'...), nullable hasta que elija uno (el cliente cae al primero del catalogo
-- si es null, ver LadyRunAvatarModal.jsx). Se guarda en Supabase (no solo local) por lo mismo que
-- avatar_dog_id (004_profiles_avatar.sql): se muestra en el Ranking, que es publico.
alter table public.profiles add column avatar_frame_id text;

grant update (avatar_frame_id) on public.profiles to authenticated;

-- Se añade al final del SELECT (no junto a avatar_dog_id) porque CREATE OR REPLACE VIEW no permite
-- reordenar/insertar columnas en medio, solo anadir al final sin tocar las posiciones existentes.
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
  p.avatar_frame_id
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username, p.avatar_dog_id, r.difficulty, p.avatar_frame_id;

grant select on public.leaderboard to anon, authenticated;
