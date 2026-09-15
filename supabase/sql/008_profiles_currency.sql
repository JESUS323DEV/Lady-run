-- Las 3 monedas (chapas/tavern_coins/huesin) pasan de vivir solo en localStorage (editable a mano
-- desde F12) a vivir en profiles. A proposito NO se hace GRANT UPDATE de estas columnas a
-- authenticated (a diferencia de avatar_dog_id en 004_profiles_avatar.sql): la unica forma de
-- tocarlas es via las funciones de abajo, que corren como SECURITY DEFINER y saltan las policies/
-- grants normales. Asi no hay ningun camino para poner un valor libre desde consola.
alter table public.profiles
  add column chapas integer not null default 0 check (chapas >= 0),
  add column tavern_coins integer not null default 0 check (tavern_coins >= 0),
  add column huesin integer not null default 0 check (huesin >= 0);

-- Suma monedas a TU PROPIA fila (recogidas en pista jugando). Solo suma, nunca acepta negativos:
-- no protege de que alguien se llame a si mismo con numeros grandes desde consola (eso no estaba
-- en el alcance pedido), pero cierra por completo poder fijar un valor libre.
create or replace function public.earn_currency(p_chapas integer default 0, p_tavern_coins integer default 0, p_huesin integer default 0)
returns table (chapas integer, tavern_coins integer, huesin integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_chapas < 0 or p_tavern_coins < 0 or p_huesin < 0 then
    raise exception 'negative_amount';
  end if;

  return query
  update public.profiles
  set chapas = profiles.chapas + p_chapas,
      tavern_coins = profiles.tavern_coins + p_tavern_coins,
      huesin = profiles.huesin + p_huesin
  where id = auth.uid()
  returning profiles.chapas, profiles.tavern_coins, profiles.huesin;
end;
$$;

grant execute on function public.earn_currency(integer, integer, integer) to authenticated;

-- Gasta moneda en un item del catalogo. El precio va FIJO aqui dentro por item_id, el cliente nunca
-- manda el precio. Si no llega a tener saldo, falla con excepcion y no cambia nada.
create or replace function public.spend_currency(p_item_id text)
returns table (chapas integer, tavern_coins integer, huesin integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  d_chapas integer;
  d_tavern_coins integer;
  d_huesin integer;
begin
  case p_item_id
    when 'corazon_extra' then d_chapas := 50; d_tavern_coins := 0; d_huesin := 0;
    when 'corazon_magico' then d_chapas := 0; d_tavern_coins := 100; d_huesin := 0;
    when 'corazon_verde' then d_chapas := 150; d_tavern_coins := 0; d_huesin := 0;
    when 'unlock_dog' then d_chapas := 0; d_tavern_coins := 5; d_huesin := 10;
    else raise exception 'unknown_item: %', p_item_id;
  end case;

  if (select profiles.chapas from public.profiles where id = auth.uid()) < d_chapas
     or (select profiles.tavern_coins from public.profiles where id = auth.uid()) < d_tavern_coins
     or (select profiles.huesin from public.profiles where id = auth.uid()) < d_huesin then
    raise exception 'insufficient_funds';
  end if;

  return query
  update public.profiles
  set chapas = profiles.chapas - d_chapas,
      tavern_coins = profiles.tavern_coins - d_tavern_coins,
      huesin = profiles.huesin - d_huesin
  where id = auth.uid()
  returning profiles.chapas, profiles.tavern_coins, profiles.huesin;
end;
$$;

grant execute on function public.spend_currency(text) to authenticated;
