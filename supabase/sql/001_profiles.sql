-- Perfiles de Lady Run: 1 fila por usuario (anonimo por ahora), solo el ID que elige para el
-- ranking global. Sin password/email reales todavia - se ligan a la cuenta anonima de Supabase
-- (auth.uid()), asi que nadie puede robar el ID de otro ni cambiarlo sin ser el dueño de esa sesion.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 20 and username ~ '^[a-zA-Z0-9_]+$'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- El ranking es publico: cualquiera (incluso sin sesion) puede leer todos los perfiles.
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

-- Solo puedes crear TU PROPIO perfil (id = tu propio auth.uid()), nunca en nombre de otro.
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Sin policy de update/delete a proposito: el ID se fija al crearlo, no se puede cambiar todavia.
