
create or replace function delete_own_user()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
