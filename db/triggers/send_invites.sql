CREATE OR REPLACE TRIGGER send_invites
AFTER INSERT ON public.team_requests
FOR EACH ROW
WHEN (NEW.type = 'invite')
EXECUTE FUNCTION supabase_functions.http_request (
  'https://5e5f-2401-4900-1c75-78d8-d842-71a7-b382-52d5.ngrok-free.app/hook/email/team-invite',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

