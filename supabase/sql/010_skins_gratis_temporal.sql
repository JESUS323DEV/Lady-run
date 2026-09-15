-- TEMPORAL: skins a precio 0 mientras se prueban las primeras skins con sprite de correr real (ver
-- FEATURES.md). Cuando se decida el precio definitivo, volver a poner el numero real aqui (y en
-- SKIN_PRICES de LadyRunSkinsModal.jsx).
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
    when 'skin_normal' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 0;
    when 'skin_ultimate' then d_chapas := 0; d_tavern_coins := 0; d_huesin := 0;
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
