# **Individual Weekly Report**

**Name**: Sam Trythall

**Team**: Stroke Rehab

**Date**: 4/7/25

## **Current Status**

### **What did *you* work on this past week?**

| Task  | Status | Time Spent |
| :---- | :---- | :---- |
| Created File Conversion Docker Container | Complete | 12 hours |
| Worked on motion file pipeline | In progress | 3 hours |

### **What problems did you run into? What is your plan for them?**

Opensim does not have a package that you can install with pip, they do have an anaconda setup, however this setup cannot be installed on a linux docker container because from what I understand it is windows exclusive. So I had to build opensim and its dependencies from source in a docker container, this took 3 hours to build and many hours of debugging old versions of dependencies and old ubuntu bugs. Thankfully, this docker container is done and ready to be integrated with the rest of our backend.

### **What is the current overall project status from your perspective?**

I think we are a little behind, but not too much, we just need to integrate the file conversion server.

### **How is your team functioning from your perspective?**

I think the team is doing fine, we have been interacting much more to get some of these more complex issues solved.

### **What new ideas did you have or skills did you develop this week?**

I learned how painful dealing with open source software can be. It is annoying when provided scripts or dockerfiles on their repo are outdated and do not work properly.

### **Who was your most awesome team member this week and why?**

Brandon was the most awesome team member this week, he worked early and helped with any problems other team members had while working on their stories.

## **Plans for Next Week**

*What are you going to work on this week?*

Integrate the file conversion server with the backend and get the motion evaluations done.