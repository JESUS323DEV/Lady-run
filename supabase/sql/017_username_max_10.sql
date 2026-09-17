-- Baja el limite maximo del ID de jugador de 20 a 10 caracteres (ver LadyRunUsernameScreen.jsx).
-- El nombre del constraint es el que genera Postgres por defecto para un CHECK inline en la
-- columna (profiles_username_check, ver 001_profiles.sql), no se le puso nombre propio alli.
alter table public.profiles
  drop constraint profiles_username_check;

alter table public.profiles
  add constraint profiles_username_check
  check (char_length(username) between 3 and 10 and username ~ '^[a-zA-Z0-9_]+$');
