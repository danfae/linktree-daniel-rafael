create table public.internship_vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  company text not null check (char_length(btrim(company)) between 1 and 60),
  area text not null check (area in (
    'Administração', 'Comunicação', 'Design', 'Direito', 'Engenharia',
    'Marketing', 'Recursos Humanos', 'Tecnologia', 'Outra'
  )),
  mode text not null check (mode in ('Presencial', 'Híbrido', 'Remoto')),
  location text not null check (char_length(btrim(location)) between 1 and 60),
  stipend text not null check (char_length(btrim(stipend)) between 1 and 50),
  email text not null check (char_length(btrim(email)) between 3 and 100),
  created_at timestamptz not null default now()
);

alter table public.internship_vacancies enable row level security;

revoke all on table public.internship_vacancies from public, anon, authenticated;
grant usage on schema public to anon;
grant select on table public.internship_vacancies to anon;
grant insert (title, company, area, mode, location, stipend, email)
  on table public.internship_vacancies to anon;

create policy "Anyone can read internship vacancies"
  on public.internship_vacancies
  for select
  to anon
  using (true);

create policy "Anyone can submit internship vacancies"
  on public.internship_vacancies
  for insert
  to anon
  with check (true);
