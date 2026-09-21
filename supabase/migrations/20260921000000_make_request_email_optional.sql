-- Email is optional in the public request form.
alter table public.requests
  alter column email drop not null;
