Complete email invite and request notifications flow
place limits
disallow team members leaving and joining between contests
a team is taking part in the contest if they have tried or submitted an answer in the contest
 
 
A user not in any team can
- Create Team
- Send Join Request to any team
- Can accept invite from any team (❌contest)
 
A user in any team as a member can
- Leave Team (❌contest)
 
A leader in any team can
- Send invites to any user whether in a team or not (❌contest)
- Can Accept join requests from users (❌contest)
- Leave Team (❌contest)
- Remove any member (❌contest)
 
All requests and invites related to a user are expired when a user joins a team
 
 
A member can
- Submit answer
 
A leader can
- Submit answer
- reveal hint
 
---
 
 
 
 
create contest service to let a team join a contest
  - client (any user from team) sends request to enter a contest by sending contest id
  - Check if valid and have not already joined, create an entry in contestEvents with (type: join_contest)
  - If the team has entered a contest, redirect to submissions page.
  
submissions page
  - Submissions page requests details of the contest challenges
  - Each challenge will have redacted array of hints with each having timeout to trigger at challenge start.
  - Client will schedule redacted hints one by one.
 
create contest service to reveal hint
  - client (team leader) sends the contest id, challenge id, hint index
  - load hints from contest id from the contests db
  - parse, create entry in contest events with (type: hint_reveal) and return hint
 
 
create checkAndCreateSubmission
  - client (any user from team) sends the contest id, challenge id, submission text
  - The default comparator is === for now and checks for submission text against challenge answer in case insensitive way.
  - If correct, the submission is created with points and all deductions (eg. from hints)
    - Take start time as time from last submission or contest_enter event
    - Calculate points from max(min_points, max_points - minutes_passed*decay_factor)
    - Create entry in contest submissions
  - also
  
leaderboard creation
  - It should be realtime
  - teams taking part are collected from contest_enter event
  - each team's points are aggregated from contest id,
  - also fetch the challenge numbers solved or level they are at
  - this leaderboard is consumed via server sent events
  - whole snapshot of the data is sent instead of individual changes.
  - if no leaderboard is present for a contest, create one using db data.
  
 
alt leaderboard stats
  - fastest to solve ith challenge
    - calculated by getting time_taken and finding out min for particular challenge
  - sprinters
    - team to solve max number of challenges in particular time frame
  -
has context menu


---
4. Create contest intimation template
8. Reconcile leaderboard and commit on end