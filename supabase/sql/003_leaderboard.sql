-- Vista con la mejor distancia por jugador, precalculada (MAX agrupado), para que la pantalla de
-- Ranking (v1: un unico listado global, sin separar por escenario, ver FEATURES.md) haga un simple
-- select en vez de agregar desde el cliente.
create view public.leaderboard as
select
  p.id as profile_id,
  p.username,
  max(r.distance) as best_distance
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username;

grant select on public.leaderboard to anon, authenticated;
