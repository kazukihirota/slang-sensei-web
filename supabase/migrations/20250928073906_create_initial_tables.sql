create extension if not exists "vector" with schema "public" version '0.8.0';

create table "public"."explanation_cache" (
    "id" uuid not null default gen_random_uuid(),
    "slang_id" uuid,
    "proficiency" text default 'B1'::text,
    "answer_md" text not null,
    "hash" text not null,
    "created_at" timestamp without time zone default now()
);


create table "public"."slang" (
    "id" uuid not null default gen_random_uuid(),
    "headword" text not null,
    "reading" text,
    "pos" text,
    "register" text default 'casual'::text,
    "dialect" text[],
    "tags" text[],
    "definition_ja" text not null,
    "definition_en" text not null,
    "polite_equiv" text,
    "notes" text,
    "popularity" integer default 0,
    "created_at" timestamp without time zone default now()
);


create table "public"."slang_example" (
    "id" uuid not null default gen_random_uuid(),
    "slang_id" uuid,
    "jp" text not null,
    "en" text not null,
    "source" text,
    "created_at" timestamp without time zone default now()
);


create table "public"."slang_vector" (
    "slang_id" uuid not null,
    "embedding" vector(768)
);


CREATE UNIQUE INDEX explanation_cache_pkey ON public.explanation_cache USING btree (id);

CREATE INDEX idx_explanation_cache_created_at ON public.explanation_cache USING btree (created_at DESC);

CREATE INDEX idx_explanation_cache_hash ON public.explanation_cache USING btree (hash);

CREATE INDEX idx_explanation_cache_proficiency ON public.explanation_cache USING btree (proficiency);

CREATE INDEX idx_explanation_cache_slang_id ON public.explanation_cache USING btree (slang_id);

CREATE INDEX idx_slang_created_at ON public.slang USING btree (created_at DESC);

CREATE INDEX idx_slang_dialect ON public.slang USING gin (dialect);

CREATE INDEX idx_slang_headword ON public.slang USING btree (headword);

CREATE INDEX idx_slang_popularity ON public.slang USING btree (popularity DESC);

CREATE INDEX idx_slang_pos ON public.slang USING btree (pos);

CREATE INDEX idx_slang_reading ON public.slang USING btree (reading);

CREATE INDEX idx_slang_register ON public.slang USING btree (register);

CREATE INDEX idx_slang_tags ON public.slang USING gin (tags);

CREATE INDEX idx_slang_vector_embedding ON public.slang_vector USING ivfflat (embedding vector_cosine_ops);

CREATE UNIQUE INDEX slang_example_pkey ON public.slang_example USING btree (id);

CREATE UNIQUE INDEX slang_pkey ON public.slang USING btree (id);

CREATE UNIQUE INDEX slang_vector_pkey ON public.slang_vector USING btree (slang_id);

alter table "public"."explanation_cache" add constraint "explanation_cache_pkey" PRIMARY KEY using index "explanation_cache_pkey";

alter table "public"."slang" add constraint "slang_pkey" PRIMARY KEY using index "slang_pkey";

alter table "public"."slang_example" add constraint "slang_example_pkey" PRIMARY KEY using index "slang_example_pkey";

alter table "public"."slang_vector" add constraint "slang_vector_pkey" PRIMARY KEY using index "slang_vector_pkey";

alter table "public"."explanation_cache" add constraint "explanation_cache_proficiency_check" CHECK ((proficiency = ANY (ARRAY['A2'::text, 'B1'::text, 'B2'::text, 'C1'::text]))) not valid;

alter table "public"."explanation_cache" validate constraint "explanation_cache_proficiency_check";

alter table "public"."explanation_cache" add constraint "explanation_cache_slang_id_fkey" FOREIGN KEY (slang_id) REFERENCES slang(id) ON DELETE CASCADE not valid;

alter table "public"."explanation_cache" validate constraint "explanation_cache_slang_id_fkey";

alter table "public"."slang" add constraint "slang_register_check" CHECK ((register = ANY (ARRAY['polite'::text, 'neutral'::text, 'casual'::text, 'vulgar'::text]))) not valid;

alter table "public"."slang" validate constraint "slang_register_check";

alter table "public"."slang_example" add constraint "slang_example_slang_id_fkey" FOREIGN KEY (slang_id) REFERENCES slang(id) ON DELETE CASCADE not valid;

alter table "public"."slang_example" validate constraint "slang_example_slang_id_fkey";

alter table "public"."slang_vector" add constraint "slang_vector_slang_id_fkey" FOREIGN KEY (slang_id) REFERENCES slang(id) ON DELETE CASCADE not valid;

alter table "public"."slang_vector" validate constraint "slang_vector_slang_id_fkey";

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

grant delete on table "public"."slang" to "anon";

grant insert on table "public"."slang" to "anon";

grant references on table "public"."slang" to "anon";

grant select on table "public"."slang" to "anon";

grant trigger on table "public"."slang" to "anon";

grant truncate on table "public"."slang" to "anon";

grant update on table "public"."slang" to "anon";

grant delete on table "public"."slang" to "authenticated";

grant insert on table "public"."slang" to "authenticated";

grant references on table "public"."slang" to "authenticated";

grant select on table "public"."slang" to "authenticated";

grant trigger on table "public"."slang" to "authenticated";

grant truncate on table "public"."slang" to "authenticated";

grant update on table "public"."slang" to "authenticated";

grant delete on table "public"."slang" to "service_role";

grant insert on table "public"."slang" to "service_role";

grant references on table "public"."slang" to "service_role";

grant select on table "public"."slang" to "service_role";

grant trigger on table "public"."slang" to "service_role";

grant truncate on table "public"."slang" to "service_role";

grant update on table "public"."slang" to "service_role";

grant delete on table "public"."slang_example" to "anon";

grant insert on table "public"."slang_example" to "anon";

grant references on table "public"."slang_example" to "anon";

grant select on table "public"."slang_example" to "anon";

grant trigger on table "public"."slang_example" to "anon";

grant truncate on table "public"."slang_example" to "anon";

grant update on table "public"."slang_example" to "anon";

grant delete on table "public"."slang_example" to "authenticated";

grant insert on table "public"."slang_example" to "authenticated";

grant references on table "public"."slang_example" to "authenticated";

grant select on table "public"."slang_example" to "authenticated";

grant trigger on table "public"."slang_example" to "authenticated";

grant truncate on table "public"."slang_example" to "authenticated";

grant update on table "public"."slang_example" to "authenticated";

grant delete on table "public"."slang_example" to "service_role";

grant insert on table "public"."slang_example" to "service_role";

grant references on table "public"."slang_example" to "service_role";

grant select on table "public"."slang_example" to "service_role";

grant trigger on table "public"."slang_example" to "service_role";

grant truncate on table "public"."slang_example" to "service_role";

grant update on table "public"."slang_example" to "service_role";

grant delete on table "public"."slang_vector" to "anon";

grant insert on table "public"."slang_vector" to "anon";

grant references on table "public"."slang_vector" to "anon";

grant select on table "public"."slang_vector" to "anon";

grant trigger on table "public"."slang_vector" to "anon";

grant truncate on table "public"."slang_vector" to "anon";

grant update on table "public"."slang_vector" to "anon";

grant delete on table "public"."slang_vector" to "authenticated";

grant insert on table "public"."slang_vector" to "authenticated";

grant references on table "public"."slang_vector" to "authenticated";

grant select on table "public"."slang_vector" to "authenticated";

grant trigger on table "public"."slang_vector" to "authenticated";

grant truncate on table "public"."slang_vector" to "authenticated";

grant update on table "public"."slang_vector" to "authenticated";

grant delete on table "public"."slang_vector" to "service_role";

grant insert on table "public"."slang_vector" to "service_role";

grant references on table "public"."slang_vector" to "service_role";

grant select on table "public"."slang_vector" to "service_role";

grant trigger on table "public"."slang_vector" to "service_role";

grant truncate on table "public"."slang_vector" to "service_role";

grant update on table "public"."slang_vector" to "service_role";


