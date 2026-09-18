-- Lista negra de palabras prohibidas en el username (evitar trolls antes de subir a itch.io). La
-- tabla NO es accesible desde el cliente (sin GRANT ni policies para anon/authenticated) - solo se
-- consulta desde la funcion security definer de abajo. Para ampliar la lista en el futuro, basta con
-- un "insert into public.banned_username_words (word) values ('...')" nuevo, sin migracion.
create table public.banned_username_words (
  word text primary key
);

-- Normaliza leetspeak basico (0->o, 4->a, 3->e, 1->i, 5->s, 7->t, @->a) antes de comparar, para que
-- "P3n3", "pen3", "p3ne" etc. caigan todos en la misma palabra de la lista sin tener que enumerar
-- cada combinacion a mano.
create or replace function public.username_is_clean(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.banned_username_words b
    where translate(lower(p_username), '043157@', 'oaeista') like '%' || b.word || '%'
  );
$$;

grant execute on function public.username_is_clean(text) to anon, authenticated;

alter table public.profiles add constraint profiles_username_clean check (public.username_is_clean(username));

insert into public.banned_username_words (word) values
  ('puta'), ('puto'), ('mierda'), ('polla'), ('pene'), ('penes'),
  ('cono'), ('coño'), ('cabron'), ('cabrón'),
  ('joder'), ('zorra'), ('maricon'), ('maricón'), ('marica'), ('marico'),
  ('gilipollas'), ('perra'), ('follar'), ('pendejo'),
  ('gonorrea'), ('hijueputa'), ('hijoeputa'), ('malparido'), ('malparida'),
  ('verga'), ('pajero'), ('concha'), ('boludo'), ('boluda'), ('chucha'),
  ('huevon'), ('huevón'), ('guevon'), ('guevón'),
  ('fuck'), ('shit'), ('bitch'), ('asshole'), ('cunt'), ('dick'), ('cock'), ('porn'),
  ('nigger'), ('nigga'), ('nazi'), ('hitler'), ('anal'), ('sexo'), ('penis'), ('vagina')
on conflict do nothing;
