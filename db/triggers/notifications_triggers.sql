create or replace trigger on_new_join_request
after insert on public.team_requests for each row

insert into public.user_notifications (for_user_id, content)
values (new.created_by, '')



create or replace trigger on_new_invite
after insert on public.team_requests for each row

insert into public.user_notifications (for_user_id, content)
values (new.)
-- do a join with users on email and check if user exists


create or replace trigger on_user_leaves_team
-- send notification to team leader when a user leaves a team


create or replace trigger on_new_contest_created
-- send notification to all users when a new contest is created