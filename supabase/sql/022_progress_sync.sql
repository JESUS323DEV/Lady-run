-- Todo el progreso que hasta ahora vivia SOLO en localStorage (tutoriales, perros/marcos/skins
-- desbloqueados, corazones en inventario, contadores diarios, nodos de Eventos, record local por
-- perro) pasa a guardarse tambien en profiles, para que se comparta entre navegadores/dispositivos
-- al vincular Google (ver project_lady_run_online_plan). Un solo campo JSON, no una columna por
-- cada cosa: son muchos campos pequeños y van a seguir creciendo, y a diferencia de las monedas
-- ninguno de ellos necesita su propio check/tipo de columna.
alter table public.profiles
  add column progress jsonb not null default '{}'::jsonb;

-- Igual patron de grant a nivel de columna que avatar_dog_id/avatar_frame_id/avatar_skin_id (ver
-- 004/011/012): el jugador puede escribir su propio progreso libremente (tutoriales completados,
-- corazones gastados, contadores del dia...), reutiliza la policy de update ya existente
-- (profiles_update_own_avatar, checkea auth.uid() = id). No es mas inseguro que lo que ya habia:
-- antes este mismo progreso vivia en localStorage, 100% editable a mano por el propio jugador -
-- aqui al menos las monedas para comprarlo siguen protegidas por spend_currency.
grant update (progress) on public.profiles to authenticated;

-- create or replace con una firma distinta (parametro nuevo) crea una funcion SOBRECARGADA en vez
-- de reemplazar la de 1 argumento - hay que borrar esa version vieja a mano, o las llamadas desde
-- el cliente (que mandan solo p_item_id) seguirian resolviendo a la version sin progress_patch.
drop function if exists public.spend_currency(text);

-- spend_currency gana un parametro opcional para fusionar de un tiron (misma transaccion) un
-- fragmento de progreso justo cuando el pago tiene exito - asi comprar un perro/marco/skin no se
-- puede "separar" en pagar sin recibir nada, o recibir sin pagar. p_progress_patch se fusiona con
-- el jsonb ya guardado (no lo reemplaza entero), igual que hace el cliente con setGameState.
create or replace function public.spend_currency(p_item_id text, p_progress_patch jsonb default null)
returns table (chapas integer, tavern_coins integer, huesin integer, progress jsonb)
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
      huesin = profiles.huesin - d_huesin,
      progress = case when p_progress_patch is null then profiles.progress else profiles.progress || p_progress_patch end
  where id = auth.uid()
  returning profiles.chapas, profiles.tavern_coins, profiles.huesin, profiles.progress;
end;
$$;

grant execute on function public.spend_currency(text, jsonb) to authenticated;
