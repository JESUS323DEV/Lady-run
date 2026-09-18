-- Permite marcar cuentas (de prueba, tipo test1) como ocultas del Ranking de forma permanente, sin
-- tener que borrar el perfil ni sus partidas (asi no hace falta volver a registrarse en local cada
-- vez). Solo se toca desde el SQL Editor (service_role) - sin GRANT de update para authenticated,
-- ningun jugador puede activarlo desde el cliente.
alter table public.profiles add column hide_from_ranking boolean not null default false;

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
where not p.hide_from_ranking
group by p.id, p.username, p.avatar_dog_id, r.difficulty, p.avatar_frame_id, p.avatar_skin_id;

grant select on public.leaderboard to anon, authenticated;

-- Marca "test1" como oculta ahora mismo.
update public.profiles set hide_from_ranking = true where username = 'test1';
