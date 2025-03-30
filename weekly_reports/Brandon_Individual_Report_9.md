# Individual Weekly Report

**Name**:
Brandon Fornero

**Team**: 
Stroke Rehab

**Date**: 
3/17/2025

## Current Status
Our project is really moving now. Over the last week, I got our hardware built and working.
I was able to record a motion file of me moving in real life, and recreate that 
motion on the skeleton model in openSense. We have most of our backend routes working, and 
the basic layout with placeholders on our frontend. All of our cloud infrastructure is 
up and running, and it is all secure with at rest and in transit encryption.

### What did _you_ work on this past week?

| Task | Status | Time Spent | 
| ---- | ------ | ---------- |
| building the hardware | complete | 2 Hours |
| Repairing outdated firmware | complete | 6 Hours |
| Successfully configuring settings and making a recording | complete | 1 Hour |
| Creating Azure Blob Storage | complete | 2 Hour |
| Uploading recordings to blob storage| in progress| 30 minutes |


### What problems did you run into? What is your plan for them?

The openSource software for opensense pi image uses an old version of python (3.6)
and the package used to upload to Blob Storage uses the most recent version of python. 
If I upgrade the pi is broken, and if I revert the upload software is broken. I 
plan on running the upload script in a venv so I can have two python versions. 

### What is the current overall project status from your perspective? 

We are nearing completion in my opinion. It looks like sprint 4 will be polishing.

### How is your team functioning from your perspective?

We are functioning great as a team. Very good communication and work ethic. 

### What new ideas did you have or skills did you develop this week?

I have learned so much about raspberry pi and firmware. This is my first time being
able to do this. 

### Who was your most awesome team member this week and why?

Derian was the best teammate for reminding us to post our progress to Jira.

## Plans for Next Week

*What are you going to work on this week?*
Fixing what I broke on the pi


