-- Ranking separado por dificultad: la vista pasa de "1 fila por jugador" a "1 fila por jugador +
-- dificultad". Se dropea y recrea entera (no solo se añade una columna) porque cambia el GROUP BY,
-- no solo la lista de columnas - CREATE OR REPLACE VIEW no habria dejado hacer esto bien.
drop view if exists public.leaderboard;

create view public.leaderboard as
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
  ) as last_dog_id
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username, p.avatar_dog_id, r.difficulty;

grant select on public.leaderboard to anon, authenticated;
