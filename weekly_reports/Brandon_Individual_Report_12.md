# Individual Weekly Report

**Name**:
Brandon Fornero

**Team**: 
Stroke Rehab

**Date**: 
4/7/2025

## Current Status
We got automatic uploads from the raspberry pi working to azure. We also got live chat
between physician and patients "working", but there is definitely some bug fixes
to work through. Most of the sites main functionality is working, and we need 
to work on polishin.

### What did _you_ work on this past week?

| Task | Status | Time Spent | 
| ---- | ------ | ---------- |
| Added motion file model to backend and db | complete | 1 hours |
| Added motion file controller functions to backend  | complete | 2 hours |
| Created functions to fetch motion files on frontend  | complete | 30 minutes |
| Created selector on frontend to choose motion file to display | complete | 30 minutes |


### What problems did you run into? What is your plan for them?
We realized the motion file conversion needs to happen on a dedicated server, to 
avoid blocking our usual backend server from serving data. We spun up a new server
dedicated to converting the files.

### What is the current overall project status from your perspective? 

We are in the polishing phase.

### How is your team functioning from your perspective?

We are functioning great as a team. Very good communication and work ethic. 

### What new ideas did you have or skills did you develop this week?

I developed stronger debugging skills this week, because we had many bugs to practice
with.

### Who was your most awesome team member this week and why?

Derian was the most awesome team member for helping Alex fix his bugs.

## Plans for Next Week

*What are you going to work on this week?*

Getting motion files automatically sent to conversion server and then uploaded to azure.
