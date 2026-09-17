-- Permite acentos/enie en el ID de jugador (ver LadyRunUsernameScreen.jsx): sigue entre 3 y 10
-- caracteres, ahora tambien letras con tilde y u con dieresis, ademas de lo que ya habia.
alter table public.profiles
  drop constraint profiles_username_check;

alter table public.profiles
  add constraint profiles_username_check
  check (char_length(username) between 3 and 10 and username ~ '^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑüÜ]+$');
