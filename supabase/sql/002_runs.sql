-- Historial de partidas de Modo Libre, 1 fila por partida terminada (no solo records - hace falta
-- el historial completo para poder sacar "perro mas jugado" mas adelante, no solo el mejor).
-- De aqui salen: ranking global (MAX distance por jugador), ranking por escenario (+ WHERE biome),
-- y estadisticas de perros (COUNT/MAX agrupado por profile_id + dog_id). Ver FEATURES.md.
create table public.runs (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  dog_id text not null,
  biome text not null,
  difficulty text not null check (difficulty in ('facil', 'medio', 'dificil')),
  distance integer not null check (distance >= 0),
  created_at timestamptz not null default now()
);

create index runs_profile_id_idx on public.runs (profile_id);
create index runs_biome_idx on public.runs (biome);

alter table public.runs enable row level security;

-- Los rankings son publicos: cualquiera puede leer todas las partidas.
create policy "runs_select_public"
  on public.runs for select
  using (true);

-- Solo puedes insertar partidas TUYAS (profile_id = tu propio auth.uid()), nunca en nombre de otro.
create policy "runs_insert_own"
  on public.runs for insert
  with check (auth.uid() = profile_id);

-- Mismo motivo que en profiles (ver supabase/sql/001_profiles.sql): "Automatically expose new
-- tables" esta desactivado a proposito, asi que hace falta GRANT explicito ademas de las policies.
grant select on public.runs to anon, authenticated;
grant insert on public.runs to authenticated;
