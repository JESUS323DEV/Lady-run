-- Añade el avatar equipado a la vista del ranking (ver 004_profiles_avatar.sql), para poder
-- mostrar el icono del perro en vez del circulo vacio cuando el jugador ya eligio uno.
-- avatar_dog_id va AL FINAL a proposito: CREATE OR REPLACE VIEW no deja insertar una columna nueva
-- en medio de las que ya existian (Postgres lo interpreta como "renombrar" la columna de esa
-- posicion), solo añadir al final.
create or replace view public.leaderboard as
select
  p.id as profile_id,
  p.username,
  max(r.distance) as best_distance,
  p.avatar_dog_id
from public.profiles p
join public.runs r on r.profile_id = p.id
group by p.id, p.username, p.avatar_dog_id;
