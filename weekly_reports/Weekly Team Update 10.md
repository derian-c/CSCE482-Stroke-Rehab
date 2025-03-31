# **Team Weekly Report**

Team: LIVE: Stroke Rehab  
Week: 10  
Members: Alex Mayer, Derian Compean, Brandon Fornero, Sam Trythall

## **Status Report**

We are back on track following the end of sprint 3 and are once again making good progress. In the last week, we implemented messaging between patients and physicians so that they have the ability to quickly communicate with another and discuss potential treatment plans. We also built our initial IMU system and tested that it was appropriately tracking motion data and uploading the recording files into blob storage using Azure. We fixed role-based access control for frontend routes so that only those users with a distinct token can access specific pages as well. In the coming weeks, we plan to begin our user testing phase and gather feedback from physicians and patients that will be our main demographic for the system. Using this feedback, we will adjust our current features to meet user expectations, add specific functionality that users would find helpful, and focus on accessibility so that our project can easily be used by those with physical and cognitive disabilities. 

## **Current Status**

### **What did the team work on this past week?**

1. 

| Task | Task Lead | Status | Notes |
| :---- | :---- | :---- | :---- |
| Implement messaging functionality for physicians and patients | Alex, Derian | Completed |  |
| Test IMU system, retrieve recording files and store them in blob with Azure | Brandon | Completed |  |
| Fix role-based access control for frontend routes | Sam | Completed |  |
| CRUD operations for patients, physicians, and administrators | Derian | Completed |  |

   

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
| Eshan Manchanda | Wondered if we could determine the symmetry of each movement at certain timestamps, asked about adding AI chatbot into frontend and that we document our code well | Will figure out what aspect of the model physicians can best pull data from, also started documenting our codebase with detailed comments explaining all functionality |

### **Are any resources needed? If so, what?**

We have all the resources we need for now.

## **Plans for Next Week**

| Task | Task Lead | Notes |
| :---- | :---- | :---- |
| Implement accessibility controls in frontend | Alex |  |
| Animate model on Physician Page with sample data | Sam |  |
| Update SQL database to document recordings | Brandon |  |
| Protect all backend routes with Auth0 | Derian |  |
| Set up patient data model in backend | Derian |  |
| Conduct user testing with physicians from Houston Methodist as well as elderly patients | Alex |  |

