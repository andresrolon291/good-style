create table if not exists public.productos (
  id text primary key,
  categoria text not null default 'Jeans',
  nombre text not null,
  precio text not null,
  imagen text default '',
  imagen2 text default '',
  imagen3 text default '',
  imagen4 text default '',
  talles text default '',
  descripcion text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.promos (
  id text primary key,
  titulo text not null,
  texto text default '',
  descuento text not null,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.productos enable row level security;
alter table public.promos enable row level security;

drop policy if exists "Sin acceso publico productos" on public.productos;
drop policy if exists "Sin acceso publico promos" on public.promos;

create policy "Sin acceso publico productos"
on public.productos
for all
to anon, authenticated
using (false)
with check (false);

create policy "Sin acceso publico promos"
on public.promos
for all
to anon, authenticated
using (false)
with check (false);
