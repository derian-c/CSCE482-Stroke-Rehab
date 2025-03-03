# **Team Weekly Report**

Team: LIVE: Stroke Rehab  
Week: 8  
Members: Alex Mayer, Derian Compean, Brandon Fornero, Sam Trythall

## **Status Report**

This week was not as productive as previous weeks, but we still got quite a lot done. Noteworthy achievements included Sam getting a model up on our frontend using WebGL, Alex creating admin and health provider views, Brandon securing the backend, and Derian setting up pytest and database crud operations. We also got some more parts for our IMU system in the mail, and the last parts are coming tomorrow. We plan on spending free time this week building and testing that IMU system. We expect the hardware part of this project to be simple, as we are following detailed instructions and using open source software for the hardware components. This leaves us the tasks of saving this captured motion data to the no-sql database, and fetching that data on the frontend securely to display for the physician.   
We also still have role-based access control issues that need working out. Auth-0 has differing opinions on how this should be done with us, so its been tough to figure out. We will continue to talk to our sponsor about status updates and constructive feedback as we near the end of our project. Our sponsor keeps trying to shift the ground under our feet with project requirements, so we have to hold our ground there\!

## **Current Status**

### **What did the team work on this past week?**

1. 

| Task | Task Lead | Status | Notes |
| :---- | :---- | :---- | :---- |
| Completing frontend pages for administrator and healthcare provider, improving appearance of frontend | Alex | Completed |  |
| Implement wireframe model into patient view | Sam | Completed |  |
| Implement testing suites | Alex and Derian | Completed |  |
| Ensure data and API call security | Brandon | Completed |  |
| Finish CRUD operations in the backend | Derian | Completed |  |

   

|  |  |  |  |
| :---- | :---- | ----- | ----- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

### **What feedback has the team received?**

| From Whom | Feedback | Next Steps |
| :---- | :---- | :---- |
| Eshan Manchanda | We were told that they want to use cameras now instead of IMUs and use machine learning instead of inverse kinematics. \-03/03/2025 | We will talk with them on 03/04/2025 about what we could change to better fit everyone’s needs. In all likelihood we will continue what we are doing already. |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

### **Are any resources needed? If so, what?**

We have all the resources we need for now.

## **Plans for Next Week**

| Task | Task Lead | Notes |
| :---- | :---- | :---- |
| Assemble IMU device | Brandon | All the necessary parts acquired, need to build testing models |
| Invite patients and physicians to create accounts | Alex |  |
| Add basic Animations for model | Sam | Add simple place in animation for model |
| Add animation processing pipeline | Sam/Brandon | Gets the IMU data ready to animate on the website. |
| Polish frontend components for accessibility | Alex  |  |
| Set up MongoDB database | Derian | This will hold the motion data from the IMU’s and VR headsets |
| Add Role Based Access Control  | Sam | This is almost done just trying to figure out why cookies aren’t saving. |

