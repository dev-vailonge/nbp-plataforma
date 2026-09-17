-- Seed for schema v2. Do not apply on the shared remote project.
--   psql "$DATABASE_URL" -f supabase/seed.sql
-- Action-plan months use calendar 1–12 (JS "2026-6" = July, "2026-7" = August).

insert into public.nbp_users (
  code, role, full_name, email, company, city, sector, phone, instagram, bio, gender, membership_status
) values
  ('u-marta', 'consultor', 'Marta Nunes', 'marta@nbp.pt', 'NBP', 'Lisboa', null, null, null, 'Consultora NBP.', 'f', 'ativo'),
  ('u-joao', 'admin', 'João Mafra', 'joao@nbp.pt', 'NBP', 'Lisboa', null, null, null, 'Equipa NBP.', 'm', 'ativo')
on conflict (code) do nothing;

insert into public.nbp_users (
  code, role, full_name, email, company, city, sector, phone, instagram, bio, gender, membership_status, consultant_id
)
select v.code, 'membro', v.full_name, v.email, v.company, v.city, v.sector, v.phone, v.instagram, v.bio, v.gender, v.status, c.id
from (
  values
    ('m-roque', 'Roque Buarque', 'roque@nbp.pt', 'NBP', 'Lisboa', 'mkt', '+351 910 000 001', 'instagram.com/roque', 'Membro activo da comunidade NBP.', 'm', 'ativo'),
    ('m-ric', 'Ricardo Almeida', 'r.almeida7@hotmail.com', 'Performance Aveiro', 'Aveiro', 'mkt', '+351 916 076 970', 'instagram.com/ricardoalmeida', 'Gestor de tráfego pago. A construir a própria agência.', 'm', 'ativo'),
    ('m-alda', 'Alda Vieira', 'alda@aldavieira.pt', 'Alda Vieira', 'Aveiro', 'marca', '+351 912 445 118', 'instagram.com/aldavieira', 'Marca pessoal com fundadores que odeiam vender.', 'f', 'ativo'),
    ('m-carla', 'Carla Moreira', 'carla.moreira@gmail.com', 'Yoga nas Escolas', 'Aveiro', 'saude', '+351 933 210 654', 'instagram.com/carlamoreira', 'Yoga para crianças. Aulas em escolas e formação de educadores.', 'f', 'ativo'),
    ('m-tiago', 'Tiago Ramos', 'tiago@macromakers.pt', 'MacroMakers', 'Aveiro', 'com', '+351 927 883 401', 'instagram.com/macromakers', 'Comunicação para indústria e B2B.', 'm', 'ativo'),
    ('m-yuri', 'Yuri Novaes', 'yuri.novaes@cft.pt', 'CFT', 'Braga', 'desp', '+351 938 447 220', 'instagram.com/yurinovaes', 'Centro de formação de futebol.', 'm', 'ativo'),
    ('m-cris', 'Cristiano Silva', 'geral@cristianosilva.pt', 'Cristiano Silva', 'Braga', 'foto', '+351 961 337 508', 'instagram.com/cristianosilva', 'Retrato corporativo de autor.', 'm', 'ativo'),
    ('m-avner', 'Avner Vasconcelos', 'avner@dadosclaros.pt', 'Dados Claros', 'Braga', 'dados', '+351 924 110 776', 'instagram.com/avnervasconcelos', 'Dashboards e automação para PME.', 'm', 'ativo'),
    ('m-sofia', 'Sofia Rebelo', 'sofia.rebelo@gmail.com', 'Rebelo VA', 'Bragança', 'va', '+351 917 004 332', 'instagram.com/sofiarebelo', 'Apoio administrativo remoto a consultores.', 'f', 'inativo'),
    ('m-ines', 'Inês Cardoso', 'ines@inescardoso.pt', 'Inês Cardoso', 'Porto', 'marca', '+351 913 559 274', 'instagram.com/inescardoso', 'Posicionamento e oferta com terapeutas.', 'f', 'ativo')
) as v(code, full_name, email, company, city, sector, phone, instagram, bio, gender, status)
join public.nbp_users c on c.code = 'u-marta'
on conflict (code) do nothing;

insert into public.nbp_courses (code, title, subtitle, kind, sort_order) values
  ('crs-formacao', 'Formação NBP', 'Percurso em 4 módulos', 'formacao', 0),
  ('crs-tutoria', 'Tutorias', 'terças, 18h00 · ensino e dúvidas', 'tutoria', 1),
  ('crs-acc', 'Accountability', 'quintas, 18h00 · números e compromissos', 'accountability', 2)
on conflict (code) do nothing;

insert into public.nbp_modules (code, course_id, title, subtitle, module_number, color, color_light, sort_order)
select v.code, c.id, v.title, v.subtitle, v.module_number, v.color, v.color_light, v.sort_order
from (
  values
    ('mod-1', 'crs-formacao', 'Fundações', 'Módulo 1', 1, '#453C96', '#CFCBF7', 0),
    ('mod-2', 'crs-formacao', 'Oferta e preço', 'Módulo 2', 2, '#125A47', '#B4E5D3', 1),
    ('mod-3', 'crs-formacao', 'Aquisição', 'Módulo 3', 3, '#7C3218', '#F1C4B0', 2),
    ('mod-4', 'crs-formacao', 'Vendas', 'Módulo 4', 4, '#7C2C46', '#F2C0D2', 3),
    ('mod-t', 'crs-tutoria', 'Tutorias', 'terças, 18h00 · ensino e dúvidas', null, '#1E4E7E', '#BBD7F4', 0),
    ('mod-a', 'crs-acc', 'Accountability', 'quintas, 18h00 · números e compromissos', null, '#6B4310', '#F3D6A6', 0)
) as v(code, course_code, title, subtitle, module_number, color, color_light, sort_order)
join public.nbp_courses c on c.code = v.course_code
on conflict (code) do nothing;

insert into public.nbp_lessons (code, module_id, title, duration_label, session_label, status, sort_order)
select v.code, m.id, v.title, v.duration_label, v.session_label, v.status, v.sort_order
from (
  values
    ('t.con', 'mod-t', 'Conteúdo', '46 min', '18 ago', 'publicado', 0),
    ('t.fin', 'mod-t', 'Financeira', '52 min', '11 ago', 'publicado', 1),
    ('t.dp', 'mod-t', 'Desenvolvimento pessoal', '41 min', '4 ago', 'publicado', 2),
    ('t.ia', 'mod-t', 'IA', '58 min', '28 jul', 'publicado', 3),
    ('a.gro', 'mod-a', 'GROWTH', '34 min', '20 ago', 'publicado', 0),
    ('a.sca', 'mod-a', 'SCALE', '29 min', '13 ago', 'publicado', 1),
    ('m1.1', 'mod-1', 'Porquê um nicho', '9 min', null, 'publicado', 0),
    ('m1.2', 'mod-1', 'Mapear o cliente ideal', '14 min', null, 'publicado', 1),
    ('m1.3', 'mod-1', 'Auditar a oferta atual', '11 min', null, 'publicado', 2),
    ('m1.4', 'mod-1', 'Escolher o mercado', '8 min', null, 'rascunho', 3),
    ('m2.1', 'mod-2', 'Anatomia de uma oferta', '12 min', null, 'publicado', 0),
    ('m2.2', 'mod-2', 'Ancoragem de valor', '16 min', null, 'publicado', 1),
    ('m2.3', 'mod-2', 'Definir a tua oferta principal', '12 min', null, 'publicado', 2),
    ('m2.4', 'mod-2', 'Estrutura de escalões', '18 min', null, 'rascunho', 3),
    ('m2.5', 'mod-2', 'Quando subir preços', '10 min', null, 'rascunho', 4),
    ('m3.1', 'mod-3', 'Escolher um canal só', '13 min', null, 'rascunho', 0),
    ('m3.2', 'mod-3', 'Guião de prospeção fria', '21 min', null, 'rascunho', 1),
    ('m3.3', 'mod-3', 'Parcerias e referências', '15 min', null, 'rascunho', 2),
    ('m4.1', 'mod-4', 'A chamada de descoberta', '19 min', null, 'publicado', 0),
    ('m4.2', 'mod-4', 'Tratar objeções', '23 min', null, 'rascunho', 1)
) as v(code, module_code, title, duration_label, session_label, status, sort_order)
join public.nbp_modules m on m.code = v.module_code
on conflict (code) do nothing;

insert into public.nbp_talks (code, title, published_on, duration_label, summary, status, featured) values
  ('tk-1', 'O preço não é o problema', '2026-08-21', '11 min', 'Porque é que baixar o preço quase nunca resolve o que parece resolver.', 'publicado', true),
  ('tk-2', 'Fazer menos, melhor', '2026-08-14', '9 min', 'Sobre escolher um canal e ficar lá tempo suficiente.', 'publicado', false),
  ('tk-3', 'A conversa que estás a evitar', '2026-08-07', '14 min', 'Clientes, sócios, equipa — o custo de adiar.', 'publicado', false),
  ('tk-4', 'Consistência não é motivação', '2026-07-31', '8 min', 'Sistemas em vez de vontade.', 'arquivo', false)
on conflict (code) do nothing;

insert into public.nbp_live_rules (code, weekday, hour, kind, rotation) values
  ('r-tut', 2, '18h00', 'tutoria', array['Desenv. pessoal', 'Financeira', 'Conteúdo', 'IA']),
  ('r-acc', 4, '18h00', 'accountability', array['GROWTH', 'SCALE'])
on conflict (code) do nothing;

insert into public.nbp_communities (slug, name, description) values
  ('nbp', 'NBP', 'Comunidade principal da No Blank Page.')
on conflict (slug) do nothing;

insert into public.nbp_community_members (community_id, user_id)
select c.id, u.id
from public.nbp_communities c
cross join public.nbp_users u
where c.slug = 'nbp' and u.membership_status = 'ativo'
on conflict do nothing;

insert into public.nbp_folders (user_id, parent_id, name, sort_order)
select u.id, null, 'Documentos', 0
from public.nbp_users u
where u.code = 'm-roque'
  and not exists (select 1 from public.nbp_folders f where f.user_id = u.id and f.parent_id is null);

insert into public.nbp_documents (folder_id, name, file_kind, url, sort_order)
select f.id, v.name, v.file_kind, v.url, v.sort_order
from public.nbp_folders f
join public.nbp_users u on u.id = f.user_id
join (
  values
    ('[AT] Mapa de…', 'gsheet', null, 0),
    ('DICTIONARY', 'gdoc', null, 1),
    ('Ebook.pdf', 'pdf', null, 2)
) as v(name, file_kind, url, sort_order) on true
where u.code = 'm-roque' and f.parent_id is null
  and not exists (select 1 from public.nbp_documents d where d.folder_id = f.id and d.name = v.name);

insert into public.nbp_action_plan_months (
  user_id, year, month, mrr, rec, nov, act, chu, lea,
  title, subtitle, flag_main, flag_prefix, flag_target, fill_pct, tela, viewport
)
select
  u.id, 2026, 7, 11200, 44100, 5, 22, 2.8, 241,
  'Oferta irresistível',
  'Etapa 3 de 9 — fechar a proposta e validar com clientes reais.',
  'Concluído', 'marco', 'Oferta validada', 28,
  '[{"t":"ret","x":70,"y":60,"w":140,"h":70,"c":0,"s":20},{"t":"txt","x":96,"y":102,"txt":"Retenção","c":0,"s":1}]'::jsonb,
  '{"ox":0,"oy":0,"z":1}'::jsonb
from public.nbp_users u
where u.code = 'm-roque'
on conflict (user_id, year, month) do nothing;

insert into public.nbp_action_plan_months (
  user_id, year, month, mrr, rec, nov, act, chu, lea,
  title, subtitle, flag_main, flag_prefix, flag_target, fill_pct, tela, viewport
)
select
  u.id, 2026, 8, 13400, 48200, 6, 27, 2.4, 312,
  'Rumo à Escala Previsível',
  'Etapa 4 de 9 — da página em branco ao negócio que não depende de si.',
  '6 dias', 'para', 'Vendas previsíveis', 38.4,
  '[
    {"t":"ret","x":60,"y":55,"w":150,"h":78,"c":0,"s":12},
    {"t":"txt","x":84,"y":100,"txt":"Oferta 2.400 €","c":0,"s":1},
    {"t":"set","x":215,"y":94,"w":90,"h":0,"c":1,"s":33},
    {"t":"eli","x":315,"y":52,"w":150,"h":86,"c":2,"s":7},
    {"t":"txt","x":342,"y":100,"txt":"2 clientes teste","c":2,"s":2},
    {"t":"set","x":135,"y":140,"w":0,"h":60,"c":3,"s":51},
    {"t":"txt","x":68,"y":228,"txt":"se resultar → tabela toda","c":3,"s":3},
    {"t":"ret","x":640,"y":70,"w":170,"h":90,"c":4,"s":61},
    {"t":"txt","x":664,"y":122,"txt":"plano B: escalões","c":4,"s":4}
  ]'::jsonb,
  '{"ox":0,"oy":0,"z":1}'::jsonb
from public.nbp_users u
where u.code = 'm-roque'
on conflict (user_id, year, month) do nothing;

insert into public.nbp_action_plan_stages (month_id, position, name, status, subtitle)
select mo.id, v.position, v.name, v.status, v.subtitle
from public.nbp_action_plan_months mo
join public.nbp_users u on u.id = mo.user_id
join (
  values
    (7, 0, 'Página em branco', 'done', '01 jul'),
    (7, 1, 'Posicionamento', 'done', '08 jul'),
    (7, 2, 'Oferta irresistível', 'done', '18 jul'),
    (7, 3, 'Aquisição de clientes', 'locked', 'próximo'),
    (7, 4, 'Vendas previsíveis', 'locked', 'dia 45'),
    (7, 5, 'Processos', 'locked', 'dia 60'),
    (7, 6, 'Equipa', 'locked', 'dia 80'),
    (7, 7, 'Delegação', 'locked', 'dia 100'),
    (7, 8, 'Escala', 'locked', 'continue'),
    (8, 0, 'Página em branco', 'done', '01 jul'),
    (8, 1, 'Posicionamento', 'done', '08 jul'),
    (8, 2, 'Oferta irresistível', 'done', '18 jul'),
    (8, 3, 'Aquisição de clientes', 'current', '45%'),
    (8, 4, 'Vendas previsíveis', 'locked', 'dia 45'),
    (8, 5, 'Processos', 'locked', 'dia 60'),
    (8, 6, 'Equipa', 'locked', 'dia 80'),
    (8, 7, 'Delegação', 'locked', 'dia 100'),
    (8, 8, 'Escala', 'locked', 'continue para descobrir')
) as v(month, position, name, status, subtitle) on v.month = mo.month
where u.code = 'm-roque' and mo.year = 2026
  and not exists (select 1 from public.nbp_action_plan_stages s where s.month_id = mo.id);

insert into public.nbp_action_plan_objectives (month_id, title, "column", lesson_id, position)
select mo.id, v.title, v.col, l.id, v.position
from public.nbp_action_plan_months mo
join public.nbp_users u on u.id = mo.user_id
join (
  values
    (7, 0, 'Guião de descoberta escrito', 'done', 'm4.1'),
    (7, 1, 'Reduzir churn para 2,5%', 'todo', null),
    (8, 0, 'Testar escalão a 2.400 € com dois clientes novos', 'todo', 'm2.4'),
    (8, 1, 'Enviar proposta à Vitor & Filhos', 'todo', 'm4.1'),
    (8, 2, 'Gravar o vídeo de onboarding', 'none', null),
    (8, 3, 'Sistema de referências a funcionar', 'done', 'm3.3')
) as v(month, position, title, col, lesson_code) on v.month = mo.month
left join public.nbp_lessons l on l.code = v.lesson_code
where u.code = 'm-roque' and mo.year = 2026
  and not exists (select 1 from public.nbp_action_plan_objectives o where o.month_id = mo.id);

insert into public.nbp_sessions (
  member_id, consultant_id, session_number, starts_at, duration_min, status, summary, tasks_count
)
select u.id, c.id, v.n, v.starts_at, v.duration_min, v.status, v.summary, v.tasks_count
from public.nbp_users u
join public.nbp_users c on c.code = 'u-marta'
join (
  values
    (9, '2026-07-08 10:00:00+01'::timestamptz, 45, 'done', 'Diagnóstico do churn e desenho do plano de retenção.', 4),
    (10, '2026-07-22 10:00:00+01'::timestamptz, 51, 'done', null, 0),
    (11, '2026-08-05 10:00:00+01'::timestamptz, 38, 'done', 'Contratação do apoio comercial e divisão de tarefas para o mês.', 2),
    (12, '2026-08-19 10:00:00+01'::timestamptz, 42, 'done', 'Revisão do escalão a 2.400 €. Ficou decidido testar com dois clientes novos antes de mexer na tabela toda.', 3),
    (13, '2026-09-02 10:00:00+01'::timestamptz, 45, 'scheduled', null, 0)
) as v(n, starts_at, duration_min, status, summary, tasks_count) on true
where u.code = 'm-roque'
  and not exists (
    select 1 from public.nbp_sessions s
    where s.member_id = u.id and s.session_number = v.n
  );

insert into public.nbp_login_days (user_id, on_date)
select u.id, d::date
from public.nbp_users u
cross join generate_series(date '2026-08-01', date '2026-08-17', interval '1 day') as d
where u.code = 'm-roque'
on conflict (user_id, on_date) do nothing;
