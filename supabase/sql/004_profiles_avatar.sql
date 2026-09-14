-- Avatar equipado del jugador (id de perro, ej. 'lady'/'gordo'...), nullable hasta que elija uno.
-- Se guarda en Supabase (no solo local) porque se muestra en el Ranking, que es publico.
alter table public.profiles add column avatar_dog_id text;

-- GRANT a nivel de COLUMNA a proposito: el usuario puede actualizar SOLO avatar_dog_id de su propia
-- fila, nunca username (esa decision de "no se puede renombrar" ya se tomo en 001_profiles.sql y
-- se mantiene - un GRANT UPDATE normal sobre toda la tabla la habria roto).
grant update (avatar_dog_id) on public.profiles to authenticated;

create policy "profiles_update_own_avatar"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
