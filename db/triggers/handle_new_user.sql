-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user () returns trigger as $$
begin
  insert into public.users (id, full_name, email, metadata)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();

