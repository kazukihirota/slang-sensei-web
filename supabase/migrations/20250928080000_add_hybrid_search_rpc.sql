-- Create hybrid search RPC function for slang lookup
create or replace function hybrid_slang_search(q text, k int default 5)
returns table (
  id uuid,
  headword text,
  reading text,
  pos text,
  register text,
  dialect text[],
  tags text[],
  definition_ja text,
  definition_en text,
  polite_equiv text,
  notes text,
  popularity int,
  examples text[]
)
language plpgsql
as $$
begin
  return query
  select 
    s.id,
    s.headword,
    s.reading,
    s.pos,
    s.register,
    s.dialect,
    s.tags,
    s.definition_ja,
    s.definition_en,
    s.polite_equiv,
    s.notes,
    s.popularity,
    coalesce(
      array_agg(se.jp || ' | ' || se.en) filter (where se.jp is not null),
      array[]::text[]
    ) as examples
  from slang s
  left join slang_example se on s.id = se.slang_id
  where 
    s.headword ilike '%' || q || '%'
    or s.reading ilike '%' || q || '%'
    or s.definition_en ilike '%' || q || '%'
    or s.definition_ja ilike '%' || q || '%'
  group by s.id, s.headword, s.reading, s.pos, s.register, s.dialect, s.tags, 
           s.definition_ja, s.definition_en, s.polite_equiv, s.notes, s.popularity
  order by 
    case when s.headword = q then 1 else 2 end,
    s.popularity desc,
    s.headword
  limit k;
end;
$$;
