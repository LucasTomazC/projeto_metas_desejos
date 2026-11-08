-- 1. Criar bucket público de imagens se não existir
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'goal-images',
  'goal-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set public = true;

-- 2. Políticas RLS para o bucket goal-images
drop policy if exists "Imagens são públicas para leitura" on storage.objects;
create policy "Imagens são públicas para leitura" on storage.objects
  for select using (bucket_id = 'goal-images');

drop policy if exists "Usuários autenticados podem enviar imagens" on storage.objects;
create policy "Usuários autenticados podem enviar imagens" on storage.objects
  for insert with check (
    bucket_id = 'goal-images' 
    and (auth.role() = 'authenticated' or auth.role() = 'anon')
  );

drop policy if exists "Usuários podem atualizar suas imagens" on storage.objects;
create policy "Usuários podem atualizar suas imagens" on storage.objects
  for update using (
    bucket_id = 'goal-images'
  );

drop policy if exists "Usuários podem deletar suas imagens" on storage.objects;
create policy "Usuários podem deletar suas imagens" on storage.objects
  for delete using (
    bucket_id = 'goal-images'
  );

