create extension if not exists "vector" with schema "public" version '0.8.0';

create table "public"."dictionary_entries" (
    "id" uuid not null default gen_random_uuid(),
    "headword" text not null,
    "reading" text,
    "pos" text,
    "register" text default 'neutral'::text,
    "dialect" text[],
    "tags" text[],
    "definition_ja" text not null,
    "definition_en" text not null,
    "polite_equiv" text,
    "notes" text,
    "popularity" integer default 0,
    "entry_type" text default 'dictionary'::text,
    "created_at" timestamp without time zone default now()
);


create table "public"."dictionary_examples" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "jp" text not null,
    "en" text not null,
    "source" text,
    "created_at" timestamp without time zone default now()
);


create table "public"."explanation_cache" (
    "id" uuid not null default gen_random_uuid(),
    "entry_id" uuid,
    "answer_md" text not null,
    "hash" text not null,
    "created_at" timestamp without time zone default now()
);


create table "public"."search_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "entry_id" uuid,
    "search_term" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."search_history" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "avatar_url" text,
    "proficiency_level" text default 'B1'::text,
    "total_searches" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_profiles" enable row level security;

CREATE UNIQUE INDEX dictionary_entries_pkey ON public.dictionary_entries USING btree (id);

CREATE UNIQUE INDEX dictionary_examples_pkey ON public.dictionary_examples USING btree (id);

CREATE UNIQUE INDEX explanation_cache_pkey ON public.explanation_cache USING btree (id);

CREATE INDEX idx_dictionary_entries_created_at ON public.dictionary_entries USING btree (created_at DESC);

CREATE INDEX idx_dictionary_entries_dialect ON public.dictionary_entries USING gin (dialect);

CREATE INDEX idx_dictionary_entries_entry_type ON public.dictionary_entries USING btree (entry_type);

CREATE INDEX idx_dictionary_entries_headword ON public.dictionary_entries USING btree (headword);

CREATE INDEX idx_dictionary_entries_popularity ON public.dictionary_entries USING btree (popularity DESC);

CREATE INDEX idx_dictionary_entries_pos ON public.dictionary_entries USING btree (pos);

CREATE INDEX idx_dictionary_entries_reading ON public.dictionary_entries USING btree (reading);

CREATE INDEX idx_dictionary_entries_register ON public.dictionary_entries USING btree (register);

CREATE INDEX idx_dictionary_entries_tags ON public.dictionary_entries USING gin (tags);

CREATE INDEX idx_dictionary_examples_entry_id ON public.dictionary_examples USING btree (entry_id);

CREATE INDEX idx_explanation_cache_created_at ON public.explanation_cache USING btree (created_at DESC);

CREATE INDEX idx_explanation_cache_entry_id ON public.explanation_cache USING btree (entry_id);

CREATE INDEX idx_explanation_cache_hash ON public.explanation_cache USING btree (hash);

CREATE INDEX idx_search_history_created_at ON public.search_history USING btree (created_at DESC);

CREATE INDEX idx_search_history_entry_id ON public.search_history USING btree (entry_id);

CREATE INDEX idx_search_history_user_id ON public.search_history USING btree (user_id);

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);

CREATE UNIQUE INDEX search_history_pkey ON public.search_history USING btree (id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

alter table "public"."dictionary_entries" add constraint "dictionary_entries_pkey" PRIMARY KEY using index "dictionary_entries_pkey";

alter table "public"."dictionary_examples" add constraint "dictionary_examples_pkey" PRIMARY KEY using index "dictionary_examples_pkey";

alter table "public"."explanation_cache" add constraint "explanation_cache_pkey" PRIMARY KEY using index "explanation_cache_pkey";

alter table "public"."search_history" add constraint "search_history_pkey" PRIMARY KEY using index "search_history_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."dictionary_entries" add constraint "dictionary_entries_entry_type_check" CHECK ((entry_type = ANY (ARRAY['slang'::text, 'dictionary'::text, 'both'::text]))) not valid;

alter table "public"."dictionary_entries" validate constraint "dictionary_entries_entry_type_check";

alter table "public"."dictionary_examples" add constraint "dictionary_examples_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) ON DELETE CASCADE not valid;

alter table "public"."dictionary_examples" validate constraint "dictionary_examples_entry_id_fkey";

alter table "public"."explanation_cache" add constraint "explanation_cache_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) ON DELETE CASCADE not valid;

alter table "public"."explanation_cache" validate constraint "explanation_cache_entry_id_fkey";

alter table "public"."search_history" add constraint "search_history_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) ON DELETE SET NULL not valid;

alter table "public"."search_history" validate constraint "search_history_entry_id_fkey";

alter table "public"."search_history" add constraint "search_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."search_history" validate constraint "search_history_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_proficiency_level_check" CHECK ((proficiency_level = ANY (ARRAY['A2'::text, 'B1'::text, 'B2'::text, 'C1'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_proficiency_level_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.hybrid_dictionary_search(q text, k integer DEFAULT 5, entry_types text[] DEFAULT ARRAY['slang'::text, 'dictionary'::text, 'both'::text])
 RETURNS TABLE(id uuid, headword text, reading text, pos text, register text, dialect text[], tags text[], definition_ja text, definition_en text, polite_equiv text, notes text, popularity integer, entry_type text, examples text[])
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select 
    de.id,
    de.headword,
    de.reading,
    de.pos,
    de.register,
    de.dialect,
    de.tags,
    de.definition_ja,
    de.definition_en,
    de.polite_equiv,
    de.notes,
    de.popularity,
    de.entry_type,
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type = any(entry_types)
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity,
           de.entry_type
  order by 
    case when de.headword = q then 1 else 2 end,
    case when de.entry_type = 'slang' then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_entry_popularity(entry_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update dictionary_entries
  set popularity = popularity + 1
  where id = entry_id_param;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_user_search_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.user_profiles
  set total_searches = total_searches + 1
  where id = new.user_id;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_dictionary_only(q text, k integer DEFAULT 5)
 RETURNS TABLE(id uuid, headword text, reading text, pos text, register text, dialect text[], tags text[], definition_ja text, definition_en text, polite_equiv text, notes text, popularity integer, examples text[])
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select 
    de.id,
    de.headword,
    de.reading,
    de.pos,
    de.register,
    de.dialect,
    de.tags,
    de.definition_ja,
    de.definition_en,
    de.polite_equiv,
    de.notes,
    de.popularity,
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type in ('dictionary', 'both')
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity
  order by 
    case when de.headword = q then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.search_slang_only(q text, k integer DEFAULT 5)
 RETURNS TABLE(id uuid, headword text, reading text, pos text, register text, dialect text[], tags text[], definition_ja text, definition_en text, polite_equiv text, notes text, popularity integer, examples text[])
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select 
    de.id,
    de.headword,
    de.reading,
    de.pos,
    de.register,
    de.dialect,
    de.tags,
    de.definition_ja,
    de.definition_en,
    de.polite_equiv,
    de.notes,
    de.popularity,
    coalesce(
      array_agg(dx.jp || ' | ' || dx.en) filter (where dx.jp is not null),
      array[]::text[]
    ) as examples
  from dictionary_entries de
  left join dictionary_examples dx on de.id = dx.entry_id
  where 
    de.entry_type in ('slang', 'both')
    and (
      de.headword ilike '%' || q || '%'
      or de.reading ilike '%' || q || '%'
      or de.definition_en ilike '%' || q || '%'
      or de.definition_ja ilike '%' || q || '%'
    )
  group by de.id, de.headword, de.reading, de.pos, de.register, de.dialect, de.tags, 
           de.definition_ja, de.definition_en, de.polite_equiv, de.notes, de.popularity
  order by 
    case when de.headword = q then 1 else 2 end,
    de.popularity desc,
    de.headword
  limit k;
end;
$function$
;

grant delete on table "public"."dictionary_entries" to "anon";

grant insert on table "public"."dictionary_entries" to "anon";

grant references on table "public"."dictionary_entries" to "anon";

grant select on table "public"."dictionary_entries" to "anon";

grant trigger on table "public"."dictionary_entries" to "anon";

grant truncate on table "public"."dictionary_entries" to "anon";

grant update on table "public"."dictionary_entries" to "anon";

grant delete on table "public"."dictionary_entries" to "authenticated";

grant insert on table "public"."dictionary_entries" to "authenticated";

grant references on table "public"."dictionary_entries" to "authenticated";

grant select on table "public"."dictionary_entries" to "authenticated";

grant trigger on table "public"."dictionary_entries" to "authenticated";

grant truncate on table "public"."dictionary_entries" to "authenticated";

grant update on table "public"."dictionary_entries" to "authenticated";

grant delete on table "public"."dictionary_entries" to "service_role";

grant insert on table "public"."dictionary_entries" to "service_role";

grant references on table "public"."dictionary_entries" to "service_role";

grant select on table "public"."dictionary_entries" to "service_role";

grant trigger on table "public"."dictionary_entries" to "service_role";

grant truncate on table "public"."dictionary_entries" to "service_role";

grant update on table "public"."dictionary_entries" to "service_role";

grant delete on table "public"."dictionary_examples" to "anon";

grant insert on table "public"."dictionary_examples" to "anon";

grant references on table "public"."dictionary_examples" to "anon";

grant select on table "public"."dictionary_examples" to "anon";

grant trigger on table "public"."dictionary_examples" to "anon";

grant truncate on table "public"."dictionary_examples" to "anon";

grant update on table "public"."dictionary_examples" to "anon";

grant delete on table "public"."dictionary_examples" to "authenticated";

grant insert on table "public"."dictionary_examples" to "authenticated";

grant references on table "public"."dictionary_examples" to "authenticated";

grant select on table "public"."dictionary_examples" to "authenticated";

grant trigger on table "public"."dictionary_examples" to "authenticated";

grant truncate on table "public"."dictionary_examples" to "authenticated";

grant update on table "public"."dictionary_examples" to "authenticated";

grant delete on table "public"."dictionary_examples" to "service_role";

grant insert on table "public"."dictionary_examples" to "service_role";

grant references on table "public"."dictionary_examples" to "service_role";

grant select on table "public"."dictionary_examples" to "service_role";

grant trigger on table "public"."dictionary_examples" to "service_role";

grant truncate on table "public"."dictionary_examples" to "service_role";

grant update on table "public"."dictionary_examples" to "service_role";

grant delete on table "public"."explanation_cache" to "anon";

grant insert on table "public"."explanation_cache" to "anon";

grant references on table "public"."explanation_cache" to "anon";

grant select on table "public"."explanation_cache" to "anon";

grant trigger on table "public"."explanation_cache" to "anon";

grant truncate on table "public"."explanation_cache" to "anon";

grant update on table "public"."explanation_cache" to "anon";

grant delete on table "public"."explanation_cache" to "authenticated";

grant insert on table "public"."explanation_cache" to "authenticated";

grant references on table "public"."explanation_cache" to "authenticated";

grant select on table "public"."explanation_cache" to "authenticated";

grant trigger on table "public"."explanation_cache" to "authenticated";

grant truncate on table "public"."explanation_cache" to "authenticated";

grant update on table "public"."explanation_cache" to "authenticated";

grant delete on table "public"."explanation_cache" to "service_role";

grant insert on table "public"."explanation_cache" to "service_role";

grant references on table "public"."explanation_cache" to "service_role";

grant select on table "public"."explanation_cache" to "service_role";

grant trigger on table "public"."explanation_cache" to "service_role";

grant truncate on table "public"."explanation_cache" to "service_role";

grant update on table "public"."explanation_cache" to "service_role";

grant delete on table "public"."search_history" to "anon";

grant insert on table "public"."search_history" to "anon";

grant references on table "public"."search_history" to "anon";

grant select on table "public"."search_history" to "anon";

grant trigger on table "public"."search_history" to "anon";

grant truncate on table "public"."search_history" to "anon";

grant update on table "public"."search_history" to "anon";

grant delete on table "public"."search_history" to "authenticated";

grant insert on table "public"."search_history" to "authenticated";

grant references on table "public"."search_history" to "authenticated";

grant select on table "public"."search_history" to "authenticated";

grant trigger on table "public"."search_history" to "authenticated";

grant truncate on table "public"."search_history" to "authenticated";

grant update on table "public"."search_history" to "authenticated";

grant delete on table "public"."search_history" to "service_role";

grant insert on table "public"."search_history" to "service_role";

grant references on table "public"."search_history" to "service_role";

grant select on table "public"."search_history" to "service_role";

grant trigger on table "public"."search_history" to "service_role";

grant truncate on table "public"."search_history" to "service_role";

grant update on table "public"."search_history" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

create policy "Service role has full access to search history"
on "public"."search_history"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Users can insert own searches"
on "public"."search_history"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view own search history"
on "public"."search_history"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Service role has full access to profiles"
on "public"."user_profiles"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Users can update own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = id));


CREATE TRIGGER on_search_recorded AFTER INSERT ON public.search_history FOR EACH ROW EXECUTE FUNCTION increment_user_search_count();

CREATE TRIGGER on_user_profile_updated BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


