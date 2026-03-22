-- Create a secure function to allow users to view their own active sessions
-- Only the authenticated user can execute this and see their own sessions securely.

CREATE OR REPLACE FUNCTION get_my_sessions()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  user_agent text,
  ip text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.created_at, s.user_agent, cast(s.ip as text) as ip
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC;
END;
$$;
