-- Baja los precios de los corazones de la tienda (ver LadyRunShopModal.jsx), demasiado caros para
-- gente que recien empieza: corazon_extra 50->10 Chapas, corazon_magico 100->15 monedas,
-- corazon_verde (Escudo verde) 150->15 Chapas.
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
    when 'corazon_extra' then d_chapas := 10; d_tavern_coins := 0; d_huesin := 0;
    when 'corazon_magico' then d_chapas := 0; d_tavern_coins := 15; d_huesin := 0;
    when 'corazon_verde' then d_chapas := 15; d_tavern_coins := 0; d_huesin := 0;
    when 'unlock_dog' then d_chapas := 0; d_tavern_coins := 5; d_huesin := 10;
    when 'skin_rare' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 5;
    when 'skin_epic' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 10;
    when 'skin_legendary' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 20;
    when 'skin_ultimate' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 0;
    when 'marco_base' then d_chapas := 50; d_tavern_coins := 0; d_huesin := 0;
    when 'marco_fondo_1' then d_chapas := 0; d_tavern_coins := 20; d_huesin := 0;
    when 'marco_fondo_2' then d_chapas := 0; d_tavern_coins := 100; d_huesin := 0;
    when 'marco_fondo_3' then d_chapas := 0; d_tavern_coins := 40; d_huesin := 0;
    when 'marco_fondo_4' then d_chapas := 0; d_tavern_coins := 100; d_huesin := 0;
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
