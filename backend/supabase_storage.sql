-- Run this once in the Supabase SQL Editor.
-- The backend returns public URLs, so this bucket must be public.
insert into storage.buckets (id, name, public)
values ('ewaste-images', 'ewaste-images', true)
on conflict (id) do update set public = true;
