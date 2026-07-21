import 'dotenv/config';
import mongoose from 'mongoose';
import Course from './models/Course.js';

async function updateFirebaseCourse() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const course = await Course.findOne({ title: "Firebase" });
    if (!course) {
      console.log("Course not found");
      process.exit(1);
    }
    
    course.syllabus = [
      { 
        week: "Lecture 1", topic: "What is Firebase & Setup", 
        video: { url: "https://www.youtube.com/embed/O17OWywmsHE", duration: "12:45" } 
      },
      { 
        week: "Lecture 2", topic: "Firebase Authentication", 
        video: { url: "https://www.youtube.com/embed/8sGY55yxicA", duration: "15:20" } 
      },
      { 
        week: "Lecture 3", topic: "Cloud Firestore Real-time Database", 
        video: { url: "https://www.youtube.com/embed/QcsAb2RR52c", duration: "18:10" } 
      },
      { 
        week: "Lecture 4", topic: "Cloud Storage for Firebase", 
        video: { url: "https://www.youtube.com/embed/SpxHVrpfGgU", duration: "14:30" } 
      },
      { 
        week: "Lecture 5", topic: "Cloud Functions", 
        video: { url: "https://www.youtube.com/embed/vr0Gfvp5v1A", duration: "10:15" } 
      },
      { 
        week: "Lecture 6", topic: "Firebase Hosting & Deployment", 
        video: { url: "https://www.youtube.com/embed/jsRVHeQd5kU", duration: "08:45" } 
      }
    ];
    
    course.assignments = [
      { title: "Assignment 1: Data Modeling", description: "Design a Firestore schema for a Social Media app, including Users, Posts, and Comments collections.", dueDate: new Date("2026-05-10"), marks: 100 },
      { title: "Assignment 2: Auth Integration", description: "Implement Google and Email/Password sign-in using Firebase Authentication.", dueDate: new Date("2026-05-15"), marks: 100 },
      { title: "Assignment 3: Cloud Triggers", description: "Create a Cloud Function that automatically sends a welcome email on new user signup.", dueDate: new Date("2026-05-20"), marks: 100 }
    ];
    
    await course.save();
    console.log("Firebase course updated successfully with youtube videos and assignments!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateFirebaseCourse();
