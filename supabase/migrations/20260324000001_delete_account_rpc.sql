-- Add RPC for "Delete My Account" so mobile apps can securely issue self-deletions without exposing service role keys.
create or replace function delete_my_account()
returns void as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Delete the authenticated user from the auth.users table
  -- Because auth.users delete will cascade to public tables via foreign key definitions (like debts, transactions)
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Revoke from public, grant strictly to authenticated
revoke execute on function delete_my_account() from public;
grant execute on function delete_my_account() to authenticated;
